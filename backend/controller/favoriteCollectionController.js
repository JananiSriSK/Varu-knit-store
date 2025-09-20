import FavoriteCollection from "../models/favoriteCollectionModel.js";
import Product from "../models/productModel.js";
import handleAsyncError from "../middleware/handleAsyncError.js";

// Get favorite collections (public)
export const getFavoriteCollections = handleAsyncError(async (req, res) => {
  let favoriteCollection = await FavoriteCollection.findOne().populate('products');
  
  if (!favoriteCollection) {
    // If no favorite collection exists, create one with 3 random products
    const randomProducts = await Product.aggregate([{ $sample: { size: 3 } }]);
    
    favoriteCollection = await FavoriteCollection.create({
      products: randomProducts.map(p => p._id)
    });
    
    favoriteCollection = await FavoriteCollection.findById(favoriteCollection._id).populate('products');
  }

  res.status(200).json({
    success: true,
    products: favoriteCollection.products
  });
});

// Set favorite collections (admin only)
export const setFavoriteCollections = handleAsyncError(async (req, res) => {
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

  // Update or create favorite collection
  let favoriteCollection = await FavoriteCollection.findOne();
  
  if (favoriteCollection) {
    favoriteCollection.products = productIds;
    favoriteCollection.updatedAt = Date.now();
    await favoriteCollection.save();
  } else {
    favoriteCollection = await FavoriteCollection.create({
      products: productIds
    });
  }

  favoriteCollection = await FavoriteCollection.findById(favoriteCollection._id).populate('products');

  res.status(200).json({
    success: true,
    message: "Favorite collections updated successfully",
    products: favoriteCollection.products
  });
});