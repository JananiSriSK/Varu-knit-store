import handleAsyncError from "../middleware/handleAsyncError.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import APIFunctionality from "../utils/APIFunctionality.js";
import HandleError from "../utils/handleError.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { convertDriveShareLink, validateDriveUrl } from "../utils/driveUtils.js";
import { parseSize } from "../utils/sizeParser.js";

//create a new product

export const createProducts = handleAsyncError(async (req, res) => {
  try {
    console.log('=== Product Creation Request ===');
    console.log('Body keys:', Object.keys(req.body));
    console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
    
    req.body.user = req.user.id;
    
    // Parse size field
    req.body.size = parseSize(req.body.size);
    
    // Handle images - either upload OR drive links
    const imageArray = [];
    
    if (req.body.uploadMethod === 'drive' && req.body.driveImages) {
      // Drive links method
      const driveImages = Array.isArray(req.body.driveImages) ? req.body.driveImages : [req.body.driveImages];
      driveImages.forEach((url, index) => {
        if (url.trim() && validateDriveUrl(url.trim())) {
          const directUrl = convertDriveShareLink(url.trim());
          imageArray.push({
            public_id: `drive_image_${Date.now()}_${index}`,
            url: directUrl,
            source: 'drive'
          });
        }
      });
    } else if (req.files && req.files.images) {
      // File upload method
      const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      
      for (const image of images) {
        if (image.size > 0) {
          console.log('Uploading product image:', image.name, 'Size:', image.size);
          const result = await uploadToCloudinary(image.data, 'varuknits/products');
          imageArray.push({ ...result, source: 'cloudinary' });
          console.log('Product image uploaded:', result.url);
        }
      }
    }
    
    if (imageArray.length > 0) {
      req.body.image = imageArray;
    }
    
    // Handle videos - either upload OR drive links
    const videoArray = [];
    
    if (req.body.uploadMethod === 'drive' && req.body.driveVideos) {
      // Drive links method
      const driveVideos = Array.isArray(req.body.driveVideos) ? req.body.driveVideos : [req.body.driveVideos];
      driveVideos.forEach((url, index) => {
        if (url.trim() && validateDriveUrl(url.trim())) {
          const directUrl = convertDriveShareLink(url.trim());
          videoArray.push({
            public_id: `drive_video_${Date.now()}_${index}`,
            url: directUrl,
            source: 'drive'
          });
        }
      });
    } else if (req.files && req.files.videos) {
      // File upload method
      const videos = Array.isArray(req.files.videos) ? req.files.videos : [req.files.videos];
      
      for (const video of videos) {
        if (video.size > 0) {
          console.log('Uploading product video:', video.name, 'Size:', video.size);
          const result = await uploadToCloudinary(video.data, 'varuknits/videos', 'video');
          videoArray.push({ ...result, source: 'cloudinary' });
          console.log('Product video uploaded:', result.url);
        }
      }
    }
    
    if (videoArray.length > 0) {
      req.body.videos = videoArray;
    }
    
    const product = await Product.create(req.body);
    console.log('Product created successfully:', product._id);
    
    // Create notifications for all users about new product
    const users = await User.find({ role: 'user' });
    const notifications = users.map(user => ({
      user: user._id,
      type: 'new_product',
      title: 'New Product Added!',
      message: `Check out our new ${product.category} item: ${product.name}`,
      data: { productId: product._id }
    }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
    
    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product'
    });
  }
});

//get all products

export const getAllProducts = handleAsyncError(async (req, res, next) => {
  try {
    console.log('getAllProducts called with query:', req.query);
    const resultsPerPage = 12;
    const page = Number(req.query.page) || 1;
    
    // Get filtered query for counting
    const countQuery = new APIFunctionality(Product.find(), req.query)
      .search()
      .filter();
    
    const productCount = await countQuery.query.countDocuments();
    const totalPages = Math.ceil(productCount / resultsPerPage);

    if (page > totalPages && productCount > 0) {
      return next(new HandleError("This page does not exist", 404));
    }

    // Get paginated products
    const apiFeatures = new APIFunctionality(Product.find(), req.query)
      .search()
      .filter()
      .pagination(resultsPerPage);

    const products = await apiFeatures.query;
    console.log('Products found:', products.length);

    res.status(200).json({
      success: true,
      products,
      resultsPerPage,
      productCount,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error('getAllProducts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch products'
    });
  }
});

//get products by subcategory

export const getSubcategory = handleAsyncError(async (req, res, next) => {
  const { category } = req.query;
  if (!category) {
    return next(new HandleError("Category is required", 400));
  }

  const subcategories = await Product.distinct("subcategory", { category });

  res.status(200).json({
    success: "true",
    subcategories,
  });
});

//update product

export const updateProduct = handleAsyncError(async (req, res, next) => {
  try {
    console.log('=== Product Update Request ===');
    console.log('Product ID:', req.params.id);
    console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
    
    let product = await Product.findById(req.params.id);
    if (!product) {
      return next(new HandleError("Product not found", 404));
    }
    
    // Handle image and video updates - either upload OR drive links
    const imageArray = [];
    const videoArray = [];
    
    // Delete old media if updating
    if (product.image && product.image.length > 0) {
      for (const img of product.image) {
        if (img.public_id && img.source === 'cloudinary') {
          console.log('Deleting old product image:', img.public_id);
          await deleteFromCloudinary(img.public_id);
        }
      }
    }
    
    if (product.videos && product.videos.length > 0) {
      for (const vid of product.videos) {
        if (vid.public_id && vid.source === 'cloudinary') {
          console.log('Deleting old product video:', vid.public_id);
          await deleteFromCloudinary(vid.public_id);
        }
      }
    }
    
    // Handle images - either upload OR drive links
    if (req.body.uploadMethod === 'drive' && req.body.driveImages) {
      // Drive links method
      const driveImages = Array.isArray(req.body.driveImages) ? req.body.driveImages : [req.body.driveImages];
      driveImages.forEach((url, index) => {
        if (url.trim() && validateDriveUrl(url.trim())) {
          const directUrl = convertDriveShareLink(url.trim());
          imageArray.push({
            public_id: `drive_image_${Date.now()}_${index}`,
            url: directUrl,
            source: 'drive'
          });
        }
      });
    } else if (req.files && req.files.images) {
      // File upload method
      const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      
      for (const image of images) {
        if (image.size > 0) {
          console.log('Uploading updated product image:', image.name);
          const result = await uploadToCloudinary(image.data, 'varuknits/products');
          imageArray.push({ ...result, source: 'cloudinary' });
          console.log('Updated product image uploaded:', result.url);
        }
      }
    }
    
    if (imageArray.length > 0) {
      req.body.image = imageArray;
    }
    
    // Handle videos - either upload OR drive links
    if (req.body.uploadMethod === 'drive' && req.body.driveVideos) {
      // Drive links method
      const driveVideos = Array.isArray(req.body.driveVideos) ? req.body.driveVideos : [req.body.driveVideos];
      driveVideos.forEach((url, index) => {
        if (url.trim() && validateDriveUrl(url.trim())) {
          const directUrl = convertDriveShareLink(url.trim());
          videoArray.push({
            public_id: `drive_video_${Date.now()}_${index}`,
            url: directUrl,
            source: 'drive'
          });
        }
      });
    } else if (req.files && req.files.videos) {
      // File upload method
      const videos = Array.isArray(req.files.videos) ? req.files.videos : [req.files.videos];
      
      for (const video of videos) {
        if (video.size > 0) {
          console.log('Uploading updated product video:', video.name);
          const result = await uploadToCloudinary(video.data, 'varuknits/videos', 'video');
          videoArray.push({ ...result, source: 'cloudinary' });
          console.log('Updated product video uploaded:', result.url);
        }
      }
    }
    
    if (videoArray.length > 0) {
      req.body.videos = videoArray;
    }
    
    // Parse size field
    req.body.size = parseSize(req.body.size);
    
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    console.log('Product updated successfully:', product._id);

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update product'
    });
  }
});

// delete product

export const deleteProduct = handleAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new HandleError("Product not found", 404));
  }
  
  // Delete images and videos from Cloudinary only
  if (product.image && product.image.length > 0) {
    for (const img of product.image) {
      if (img.public_id && img.source === 'cloudinary') {
        await deleteFromCloudinary(img.public_id);
      }
    }
  }
  
  if (product.videos && product.videos.length > 0) {
    for (const vid of product.videos) {
      if (vid.public_id && vid.source === 'cloudinary') {
        await deleteFromCloudinary(vid.public_id);
      }
    }
  }
  
  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: "true",
    message: "Product deleted successfully",
  });
});

// get single product

export const getProductDetails = handleAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new HandleError("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

//create product review

export const createProductReview = handleAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating), //in frontend inpy=ut is in the form of string
    comment,
  };

  const product = await Product.findById(productId);

  if (!product) {
    return next(new HandleError("No product found", 400));
  }

  const reviewExists = product.reviews.find(
    (review) => review.user.toString() === req.user.id.toString()
  ); //comparing id of logged in user and user id from the review

  if (reviewExists) {
    //update the review if it already exixts

    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user.id.toString()) {
        (review.rating = rating), (review.comment = comment);
      }
    });
  } else {
    // review does not exist, so push the new review into the reviews array
    product.reviews.push(review);
  }

  product.numberOfReviews = product.reviews.length; //calculating number of reviews
  let sum = 0;
  product.reviews.forEach((review) => {
    //calculating average rating
    sum += review.rating;
  });
  product.ratings =
    product.reviews.length > 0 ? sum / product.reviews.length : 0; // no reviews= error, so setting it to 0

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    product,
  });
});

//get product review

export const getProductReviews = handleAsyncError(async (req, res, next) => {
  //using query property eg.: http://localhost:5000/api/v1/reviews?id=6847df7a30194898ee617c75
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new HandleError("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//delete product review
export const deleteProductReview = handleAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId); // find product

  if (!product) {
    return next(new HandleError("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  );

  let sum = 0;
  reviews.forEach((review) => {
    sum += review.rating;
  });
  const ratings = reviews.length > 0 ? sum / reviews.length : 0; //updating no. of reviews
  const numberOfReviews = reviews.length; //updating no. of reviews

  await Product.findByIdAndUpdate(
    req.query.productId,
    { reviews, numberOfReviews, ratings },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Review Deleted successfully",
  });
});

//Admin view - get all products

export const getAdminProducts = handleAsyncError(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});