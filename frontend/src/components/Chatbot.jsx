import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      setMessages([{
        type: 'bot',
        message: "Hello! Welcome to Varu's Comfy Knits! 👋 I'm here to help you with orders, products, shipping, and more. How can I assist you today?",
        suggestions: ["Check order status", "Shipping info", "Return policy", "Contact support"],
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Hide chatbot for admin users
  if (user?.role === 'admin') {
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      type: 'user',
      message: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await api.chatbot(message.trim(), user?.id);
      const data = await response.json();

      if (data.success) {
        const botMessage = {
          type: 'bot',
          message: data.response,
          suggestions: data.suggestions || [],
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        type: 'bot',
        message: "Sorry, I'm having trouble right now. Please try again or contact support at +91 9150324779",
        suggestions: ["Try again", "Contact support"],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center justify-center ${
          isOpen 
            ? 'bg-[#D97878] hover:bg-[#c76666]' 
            : 'bg-[#A084CA] hover:bg-[#8b6bb1]'
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-[#A084CA] text-white p-4 rounded-t-lg flex items-center gap-3">
            <Bot className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">Varu's Assistant</h3>
              <p className="text-xs opacity-90">Online now</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-lg p-3 ${
                  msg.type === 'user' 
                    ? 'bg-[#A084CA] text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="flex items-start gap-2">
                    {msg.type === 'bot' && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                    {msg.type === 'user' && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                    <div className="text-sm">{msg.message}</div>
                  </div>
                  
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left text-xs bg-white text-[#A084CA] px-2 py-1 rounded border border-[#A084CA] hover:bg-[#f7f4ff] transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A084CA] text-sm"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !inputMessage.trim()}
                className="bg-[#A084CA] text-white p-2 rounded-lg hover:bg-[#8b6bb1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;