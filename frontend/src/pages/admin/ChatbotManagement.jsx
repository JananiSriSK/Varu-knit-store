import React, { useState } from 'react';
import { Save, Plus, Trash2, MessageCircle, Settings } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const ChatbotManagement = () => {
  const [chatbotSettings, setChatbotSettings] = useState({
    enabled: true,
    welcomeMessage: "Hello! Welcome to Varu's Comfy Knits! 👋 I'm here to help you with orders, products, shipping, and more. How can I assist you today?",
    businessHours: {
      enabled: false,
      start: "09:00",
      end: "18:00"
    }
  });

  const [faqs, setFaqs] = useState([
    {
      id: 1,
      question: "What are your shipping charges?",
      answer: "We offer free shipping on orders above ₹1000. For orders below ₹1000, shipping charges are ₹100.",
      category: "Shipping"
    },
    {
      id: 2,
      question: "How can I track my order?",
      answer: "You can track your order by going to 'My Profile' > 'Orders' section. You'll see the current status of all your orders there.",
      category: "Orders"
    },
    {
      id: 3,
      question: "What is your return policy?",
      answer: "We accept returns within 7 days of delivery. Items must be unused and in original condition. Please contact us for return instructions.",
      category: "Returns"
    }
  ]);

  const [newFaq, setNewFaq] = useState({
    question: '',
    answer: '',
    category: 'General'
  });

  const { addNotification } = useNotification();

  const handleSettingsChange = (field, value) => {
    setChatbotSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBusinessHoursChange = (field, value) => {
    setChatbotSettings(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [field]: value
      }
    }));
  };

  const handleAddFaq = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      addNotification('Please fill in both question and answer', 'warning');
      return;
    }

    const faq = {
      id: Date.now(),
      ...newFaq
    };

    setFaqs(prev => [...prev, faq]);
    setNewFaq({ question: '', answer: '', category: 'General' });
    addNotification('FAQ added successfully', 'success');
  };

  const handleDeleteFaq = (id) => {
    setFaqs(prev => prev.filter(faq => faq.id !== id));
    addNotification('FAQ deleted successfully', 'success');
  };

  const handleSaveSettings = () => {
    // Here you would typically save to backend
    addNotification('Chatbot settings saved successfully', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-700">Chatbot Management</h2>
        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-4 py-2 bg-[#7b5fc4] text-white rounded-lg hover:bg-[#6b4fb4] transition"
        >
          <Save className="h-4 w-4" />
          Save All Changes
        </button>
      </div>

      {/* Chatbot Settings */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-[#7b5fc4]" />
          <h3 className="text-lg font-semibold text-[#7b5fc4]">Chatbot Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="chatbot-enabled"
              checked={chatbotSettings.enabled}
              onChange={(e) => handleSettingsChange('enabled', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="chatbot-enabled" className="text-sm font-medium">
              Enable Chatbot
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Welcome Message
            </label>
            <textarea
              value={chatbotSettings.welcomeMessage}
              onChange={(e) => handleSettingsChange('welcomeMessage', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="business-hours"
                checked={chatbotSettings.businessHours.enabled}
                onChange={(e) => handleBusinessHoursChange('enabled', e.target.checked)}
                className="rounded"
              />
              <label htmlFor="business-hours" className="text-sm font-medium">
                Enable Business Hours
              </label>
            </div>

            {chatbotSettings.businessHours.enabled && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={chatbotSettings.businessHours.start}
                    onChange={(e) => handleBusinessHoursChange('start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b5fc4]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">End Time</label>
                  <input
                    type="time"
                    value={chatbotSettings.businessHours.end}
                    onChange={(e) => handleBusinessHoursChange('end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b5fc4]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Management */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-[#7b5fc4]" />
          <h3 className="text-lg font-semibold text-[#7b5fc4]">FAQ Management</h3>
        </div>

        {/* Add New FAQ */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium mb-3">Add New FAQ</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Question"
                value={newFaq.question}
                onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b5fc4]"
              />
              <select
                value={newFaq.category}
                onChange={(e) => setNewFaq(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b5fc4]"
              >
                <option value="General">General</option>
                <option value="Orders">Orders</option>
                <option value="Shipping">Shipping</option>
                <option value="Returns">Returns</option>
                <option value="Products">Products</option>
              </select>
            </div>
            <textarea
              placeholder="Answer"
              value={newFaq.answer}
              onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b5fc4]"
            />
            <button
              onClick={handleAddFaq}
              className="flex items-center gap-2 px-4 py-2 bg-[#e1cffb] text-[#444444] rounded-lg hover:bg-[#b89ae8] transition"
            >
              <Plus className="h-4 w-4" />
              Add FAQ
            </button>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm bg-[#e1cffb] text-[#7b5fc4] px-2 py-1 rounded">
                      {faq.category}
                    </span>
                  </div>
                  <h5 className="font-medium text-gray-800 mb-1">{faq.question}</h5>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
                <button
                  onClick={() => handleDeleteFaq(faq.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatbotManagement;