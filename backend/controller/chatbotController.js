import Order from "../models/orderModel.js";

// Simple rule-based chatbot (can be enhanced with OpenAI later)
export const chatbotResponse = async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    const messageLower = message.toLowerCase();
    let response = "";
    let suggestions = [];

    // Order status inquiries
    if (messageLower.includes('order') && (messageLower.includes('status') || messageLower.includes('track'))) {
      if (userId) {
        const recentOrder = await Order.findOne({ user: userId }).sort({ createdAt: -1 });
        if (recentOrder) {
          response = `Your most recent order (${recentOrder._id.toString().slice(-6)}) is currently: ${recentOrder.orderStatus}`;
          if (recentOrder.orderStatus === 'Shipped' && recentOrder.shippedAt) {
            response += ` (Shipped on ${new Date(recentOrder.shippedAt).toLocaleDateString()})`;
          }
        } else {
          response = "You don't have any orders yet. Browse our products to place your first order!";
        }
      } else {
        response = "Please log in to check your order status.";
      }
      suggestions = ["View all orders", "Contact support"];
    }
    
    // Return policy
    else if (messageLower.includes('return') || messageLower.includes('refund')) {
      response = "Our return policy: You can return items within 7 days of delivery if they're unused and in original condition. Refunds are processed within 5-7 business days.";
      suggestions = ["How to return", "Refund status", "Contact support"];
    }
    
    // Shipping information
    else if (messageLower.includes('shipping') || messageLower.includes('delivery')) {
      response = "We offer free shipping on orders above ₹1000. Standard delivery takes 3-5 business days. Express delivery (1-2 days) is available for ₹100 extra.";
      suggestions = ["Track order", "Shipping rates", "Delivery areas"];
    }
    
    // Payment methods
    else if (messageLower.includes('payment') || messageLower.includes('pay')) {
      response = "We accept UPI payments. After placing your order, you'll receive a QR code to complete the payment. Upload the payment screenshot for verification.";
      suggestions = ["Payment issues", "UPI help", "Contact support"];
    }
    
    // Product inquiries
    else if (messageLower.includes('product') || messageLower.includes('size') || messageLower.includes('material')) {
      response = "All our products are handmade with premium yarn. Sizes available: XS, S, M, L, XL. For specific product questions, please check the product description or contact us.";
      suggestions = ["Size guide", "Material info", "Custom orders"];
    }
    
    // Contact information
    else if (messageLower.includes('contact') || messageLower.includes('support') || messageLower.includes('help')) {
      response = "You can reach us at: Phone: +91 9150324779 | Email: support@varuknits.com | We're available Mon-Sat, 9 AM - 6 PM.";
      suggestions = ["Call now", "Email us", "FAQ"];
    }
    
    // Greetings
    else if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('hey')) {
      response = "Hello! Welcome to Varu's Comfy Knits! 👋 I'm here to help you with orders, products, shipping, and more. How can I assist you today?";
      suggestions = ["Check order status", "Browse products", "Shipping info", "Return policy"];
    }
    
    // Default response
    else {
      response = "I'm here to help! I can assist you with order status, shipping information, return policy, payment methods, and product details. What would you like to know?";
      suggestions = ["Order status", "Shipping info", "Return policy", "Contact support"];
    }

    res.status(200).json({
      success: true,
      response,
      suggestions,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get FAQ
export const getFAQ = async (req, res) => {
  try {
    const faq = [
      {
        question: "How long does shipping take?",
        answer: "Standard delivery takes 3-5 business days. Express delivery (1-2 days) is available for ₹100 extra."
      },
      {
        question: "What is your return policy?",
        answer: "You can return items within 7 days of delivery if they're unused and in original condition."
      },
      {
        question: "How do I track my order?",
        answer: "You can track your order in the 'My Profile' section after logging in."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept UPI payments. You'll receive a QR code after placing your order."
      },
      {
        question: "Are your products handmade?",
        answer: "Yes! All our products are lovingly handmade with premium quality yarn."
      }
    ];

    res.status(200).json({
      success: true,
      faq
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};