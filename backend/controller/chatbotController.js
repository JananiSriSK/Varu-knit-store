import ChatbotResponse from "../models/chatbotResponseModel.js";
import handleAsyncError from "../middleware/handleAsyncError.js";

// Get chatbot responses (admin)
export const getChatbotResponses = handleAsyncError(async (req, res) => {
  const responses = await ChatbotResponse.find().sort({ priority: -1 });
  
  res.status(200).json({
    success: true,
    responses
  });
});

// Create chatbot response (admin)
export const createChatbotResponse = handleAsyncError(async (req, res) => {
  const { keywords, response, suggestions, priority } = req.body;
  
  const chatbotResponse = await ChatbotResponse.create({
    keywords: keywords.split(',').map(k => k.trim().toLowerCase()),
    response,
    suggestions: suggestions ? suggestions.split(',').map(s => s.trim()) : [],
    priority: priority || 1
  });
  
  res.status(201).json({
    success: true,
    response: chatbotResponse
  });
});

// Update chatbot response (admin)
export const updateChatbotResponse = handleAsyncError(async (req, res) => {
  const { keywords, response, suggestions, priority, isActive } = req.body;
  
  const chatbotResponse = await ChatbotResponse.findByIdAndUpdate(
    req.params.id,
    {
      keywords: keywords.split(',').map(k => k.trim().toLowerCase()),
      response,
      suggestions: suggestions ? suggestions.split(',').map(s => s.trim()) : [],
      priority: priority || 1,
      isActive
    },
    { new: true }
  );
  
  res.status(200).json({
    success: true,
    response: chatbotResponse
  });
});

// Delete chatbot response (admin)
export const deleteChatbotResponse = handleAsyncError(async (req, res) => {
  await ChatbotResponse.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: "Response deleted successfully"
  });
});

// Process chat message (public)
export const processChat = handleAsyncError(async (req, res) => {
  const { message } = req.body;
  const messageLower = message.toLowerCase();
  
  // Get all active responses
  const responses = await ChatbotResponse.find({ isActive: true }).sort({ priority: -1 });
  
  // Find matching response
  let matchedResponse = null;
  for (const resp of responses) {
    if (resp.keywords.some(keyword => messageLower.includes(keyword))) {
      matchedResponse = resp;
      break;
    }
  }
  
  // Default response if no match
  if (!matchedResponse) {
    return res.status(200).json({
      success: true,
      response: "Hello! How can I help you today?",
      suggestions: ["Order status", "Shipping info", "Product help"]
    });
  }
  
  res.status(200).json({
    success: true,
    response: matchedResponse.response,
    suggestions: matchedResponse.suggestions
  });
});