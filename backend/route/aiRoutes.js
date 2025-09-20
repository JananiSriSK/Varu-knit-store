import express from "express";
import { verifyUserAuth } from "../middleware/userAuth.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import mongoose from "mongoose";

const router = express.Router();
const ML_SERVICE_URL = 'http://localhost:5001';



// Proxy to Flask ML service (required)
const proxyToML = async (endpoint, method = 'GET', data = null) => {
  const url = `${ML_SERVICE_URL}${endpoint}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Flask ML service error: ${response.status}`);
  }
  
  const result = await response.json();
  
  // If ML service returns product IDs, fetch full product data
  if (result.success && result.recommendations && Array.isArray(result.recommendations)) {
    const products = await Product.find({ _id: { $in: result.recommendations } })
      .select('name price image category ratings numberOfReviews');
    result.recommendations = products;
  }
  
  return result;
};

// Recommendation routes
router.route("/recommendations/:productId").get(async (req, res) => {
  try {
    const result = await proxyToML(
      `/recommendations/frequently-bought-together/${req.params.productId}`
    );
    res.json(result);
  } catch (error) {
    res.status(503).json({ 
      success: false, 
      message: 'ML service unavailable. Please ensure Flask ML service is running on port 5001.' 
    });
  }
});

router.route("/recommendations/personalized").get(verifyUserAuth, async (req, res) => {
  try {
    const result = await proxyToML(
      `/recommendations/personalized/${req.user.id}`
    );
    res.json(result);
  } catch (error) {
    res.status(503).json({ 
      success: false, 
      message: 'ML service unavailable. Please ensure Flask ML service is running on port 5001.' 
    });
  }
});

// Search routes
router.route("/search").get(async (req, res) => {
  try {
    const { query, category } = req.query;
    const result = await proxyToML('/search/smart', 'POST', { query, category });
    res.json(result);
  } catch (error) {
    res.status(503).json({ 
      success: false, 
      message: 'ML service unavailable. Please ensure Flask ML service is running on port 5001.' 
    });
  }
});

router.route("/search/suggestions").get(async (req, res) => {
  try {
    const { query } = req.query;
    const result = await proxyToML('/search/suggestions', 'POST', { query });
    res.json(result);
  } catch (error) {
    res.status(503).json({ 
      success: false, 
      message: 'ML service unavailable. Please ensure Flask ML service is running on port 5001.' 
    });
  }
});

// Chatbot routes
router.route("/chat").post(async (req, res) => {
  try {
    const result = await proxyToML('/chat', 'POST', req.body);
    res.json(result);
  } catch (error) {
    res.status(503).json({ 
      success: false, 
      message: 'ML service unavailable. Please ensure Flask ML service is running on port 5001.' 
    });
  }
});

export default router;