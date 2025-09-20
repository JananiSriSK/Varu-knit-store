import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import mongoose from "mongoose";

// Get frequently bought together products
export const getFrequentlyBoughtTogether = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find orders containing this product
    const ordersWithProduct = await Order.find({
      "orderItems.product": productId,
      orderStatus: { $in: ["Delivered", "Verified and Confirmed", "Shipped"] }
    });

    // Count co-occurrences
    const coOccurrences = {};
    
    ordersWithProduct.forEach(order => {
      const otherProducts = order.orderItems
        .filter(item => item.product.toString() !== productId)
        .map(item => item.product.toString());
      
      otherProducts.forEach(otherProductId => {
        coOccurrences[otherProductId] = (coOccurrences[otherProductId] || 0) + 1;
      });
    });

    // Get top 5 frequently bought together products
    const topProducts = Object.entries(coOccurrences)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([productId]) => productId);

    let recommendations = await Product.find({ _id: { $in: topProducts } })
      .select('name price image category');

    // Fallback: If no frequently bought together, show similar category products
    if (recommendations.length === 0) {
      const currentProduct = await Product.findById(productId);
      if (currentProduct) {
        recommendations = await Product.find({ 
          category: currentProduct.category,
          _id: { $ne: productId }
        })
        .select('name price image category')
        .limit(4);
      }
    }

    res.status(200).json({
      success: true,
      recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get personalized recommendations for user
export const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's order history
    const userOrders = await Order.find({ 
      user: userId,
      orderStatus: { $in: ["Delivered", "Verified and Confirmed", "Shipped"] }
    });

    const userProducts = new Set();
    const userCategories = {};
    
    userOrders.forEach(order => {
      order.orderItems.forEach(item => {
        userProducts.add(item.product.toString());
      });
    });

    // Find similar users (users who bought similar products)
    const similarUsers = await Order.aggregate([
      {
        $match: {
          "orderItems.product": { $in: Array.from(userProducts) },
          user: { $ne: new mongoose.Types.ObjectId(userId) },
          orderStatus: { $in: ["Delivered", "Verified and Confirmed", "Shipped"] }
        }
      },
      {
        $group: {
          _id: "$user",
          commonProducts: { $addToSet: "$orderItems.product" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get products bought by similar users that current user hasn't bought
    const recommendedProductIds = new Set();
    
    for (const similarUser of similarUsers) {
      const similarUserOrders = await Order.find({ 
        user: similarUser._id,
        orderStatus: { $in: ["Delivered", "Verified and Confirmed", "Shipped"] }
      });
      
      similarUserOrders.forEach(order => {
        order.orderItems.forEach(item => {
          if (!userProducts.has(item.product.toString())) {
            recommendedProductIds.add(item.product.toString());
          }
        });
      });
    }

    let recommendations = await Product.find({ 
      _id: { $in: Array.from(recommendedProductIds).slice(0, 8) }
    }).select('name price image category ratings');

    // Fallback: If no collaborative filtering results, show popular products
    if (recommendations.length === 0) {
      recommendations = await Product.find({})
        .sort({ ratings: -1, numberOfReviews: -1 })
        .select('name price image category ratings')
        .limit(4);
    }

    res.status(200).json({
      success: true,
      recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};