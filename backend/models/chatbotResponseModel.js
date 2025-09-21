import mongoose from "mongoose";

const chatbotResponseSchema = new mongoose.Schema({
  keywords: [{
    type: String,
    required: true
  }],
  response: {
    type: String,
    required: true
  },
  suggestions: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

const ChatbotResponse = mongoose.model("ChatbotResponse", chatbotResponseSchema);
export default ChatbotResponse;