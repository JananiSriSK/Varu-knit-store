import handleAsyncError from "../middleware/handleAsyncError.js";
import Product from "../models/productModel.js";
import APIFunctionality from "../utils/apiFunctionality.js";
import HandleError from "../utils/handleError.js";

//create a new product

export const createProducts = handleAsyncError(async (req, res) => {
  req.body.user = req.user.id; // id of user(admin) who created the product
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

//get all products

export const getAllProducts = handleAsyncError(async (req, res, next) => {
  console.log(req.query);
  const resultsPerPage = 3;
  const apiFeatures = new APIFunctionality(Product.find(), req.query)
    .search()
    .filter();
  // .pagination(resultsPerPage);

  const filteredQuery = apiFeatures.query.clone();
  const productCount = await filteredQuery.countDocuments();

  const totalPages = Math.ceil(productCount / resultsPerPage);
  const products = await apiFeatures.query;
  const page = Number(req.query.page) || 1;

  if (page > totalPages && productCount > 0) {
    return next(new HandleError("This page does not exist", 404));
  }

  apiFeatures.pagination(resultsPerPage);

  if (!products || products.length == 0) {
    return next(new HandleError("No product found", 404));
  }
  res.status(200).json({
    success: "true",
    products,
    resultsPerPage,
    productCount,
    totalPages,
    currentPage: page,
  });
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
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    return next(new HandleError("Product not found", 404));
  }

  res.status(200).json({
    success: "true",
    product,
  });
});

// delete product

export const deleteProduct = handleAsyncError(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(new HandleError("Product not found", 404));
  }

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
