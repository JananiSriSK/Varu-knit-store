import LatestCollection from "../models/latestCollectionModel.js";
import Product from "../models/productModel.js";
import handleAsyncError from "../middleware/handleAsyncError.js";

// Get latest collections (public)
export const getLatestCollections = handleAsyncError(async (req, res) => {
  let latestCollection = await LatestCollection.findOne().populate('products');
  
  if (!latestCollection) {
    // If no latest collection exists, create one with 3 random products
    const randomProducts = await Product.aggregate([{ $sample: { size: 3 } }]);
    
    latestCollection = await LatestCollection.create({
      products: randomProducts.map(p => p._id)
    });
    
    latestCollection = await LatestCollection.findById(latestCollection._id).populate('products');
  }

  res.status(200).json({
    success: true,
    products: latestCollection.products
  });
});

// Set latest collections (admin only)
export const setLatestCollections = handleAsyncError(async (req, res) => {
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length !== 3) {
    return res.status(400).json({
      success: false,
      message: "Please provide exactly 3 product IDs"
    });
  }

  // Verify all products exist
  const products = await Product.find({ _id: { $in: productIds } });
  if (products.length !== 3) {
    return res.status(400).json({
      success: false,
      message: "One or more products not found"
    });
  }

  // Update or create latest collection
  let latestCollection = await LatestCollection.findOne();
  
  if (latestCollection) {
    latestCollection.products = productIds;
    latestCollection.updatedAt = Date.now();
    await latestCollection.save();
  } else {
    latestCollection = await LatestCollection.create({
      products: productIds
    });
  }

  latestCollection = await LatestCollection.findById(latestCollection._id).populate('products');

  res.status(200).json({
    success: true,
    message: "Latest collections updated successfully",
    products: latestCollection.products
  });
});