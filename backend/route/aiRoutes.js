import express from "express";
import { verifyUserAuth } from "../middleware/userAuth.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import mongoose from "mongoose";

const router = express.Router();
const ML_SERVICE_URL = 'http://localhost:5001';



// Proxy to Flask ML service with fallback
const proxyToML = async (endpoint, method = 'GET', data = null) => {
  try {
    const url = `${ML_SERVICE_URL}${endpoint}`;
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 3000
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`ML service error: ${response.status}`);
    }
    
    const result = await response.json();
    
    // If ML service returns product IDs, fetch full product data
    if (result.success && result.recommendations && Array.isArray(result.recommendations)) {
      const products = await Product.find({ _id: { $in: result.recommendations } })
        .select('name price image category ratings numberOfReviews');
      result.recommendations = products;
    }
    
    return result;
  } catch (error) {
    console.log(`ML service unavailable, using fallback for ${endpoint}`);
    throw error;
  }
};

// Fallback functions
const getFallbackRecommendations = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    return { success: true, recommendations: [] };
  }
  
  const recommendations = await Product.find({
    category: product.category,
    _id: { $ne: productId }
  })
  .select('name price image category ratings numberOfReviews')
  .limit(4);
  
  return { success: true, recommendations };
};

const getFallbackPersonalized = async () => {
  const recommendations = await Product.find({})
    .sort({ ratings: -1, numberOfReviews: -1 })
    .select('name price image category ratings numberOfReviews')
    .limit(8);
  
  return { success: true, recommendations };
};

const getFallbackSearch = async (query) => {
  if (!query) return { success: false, products: [] };
  
  const products = await Product.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } }
    ]
  }).limit(20);
  
  return { success: true, products, count: products.length };
};

const getFallbackSuggestions = async (query) => {
  if (!query || query.length < 2) return { success: true, suggestions: [] };
  
  const products = await Product.find({
    name: { $regex: query, $options: 'i' }
  }).limit(5);
  
  const suggestions = products.map(p => p.name);
  return { success: true, suggestions };
};

// Recommendation routes
router.route("/recommendations/:productId").get(async (req, res) => {
  try {
    const result = await proxyToML(
      `/recommendations/frequently-bought-together/${req.params.productId}`
    );
    res.json(result);
  } catch (error) {
    const fallback = await getFallbackRecommendations(req.params.productId);
    res.json(fallback);
  }
});

router.route("/recommendations/personalized").get(async (req, res) => {
  try {
    const userId = req.query.userId || 'anonymous';
    const result = await proxyToML(
      `/recommendations/personalized/${userId}`
    );
    res.json(result);
  } catch (error) {
    const fallback = await getFallbackPersonalized();
    res.json(fallback);
  }
});

// Search routes
router.route("/search").get(async (req, res) => {
  try {
    const { query, category } = req.query;
    const result = await proxyToML('/search/smart', 'POST', { query, category });
    res.json(result);
  } catch (error) {
    const fallback = await getFallbackSearch(query);
    res.json(fallback);
  }
});

router.route("/search/suggestions").get(async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json({ success: true, suggestions: [] });
    }
    const result = await proxyToML('/search/suggestions', 'POST', { query });
    res.json(result);
  } catch (error) {
    const fallback = await getFallbackSuggestions(req.query.query);
    res.json(fallback);
  }
});

// Chatbot routes
router.route("/chat").post(async (req, res) => {
  try {
    const result = await proxyToML('/chat', 'POST', req.body);
    res.json(result);
  } catch (error) {
    res.json({
      success: true,
      response: "I'm here to help! The AI service is currently unavailable, but you can contact our support team at varalakshmikutti76@gmail.com or call +91 9944610600 for immediate assistance with any questions about orders, products, shipping, or returns.",
      suggestions: ["Contact support", "Email us", "Call us", "View products"]
    });
  }
});

export default router;