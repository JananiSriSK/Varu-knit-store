import React, { useState, useEffect } from 'react';
import { Save, Upload, Eye, EyeOff } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaEnvelope, FaFacebook } from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';

const EditFooter = () => {
  const [footerData, setFooterData] = useState({
    phone: '+91 9944610600',
    email: 'varalakshmikutti76@gmail.com',
    instagram: '@varuknitstore',
    whatsappLink: 'https://wa.me/919944610600',
    instagramLink: 'https://www.instagram.com/varuknitstore',
    facebookLink: 'https://www.facebook.com',
    aboutText: 'Every product is handmade with love, care and attention to detail.',
    copyrightText: 'VaruKnitStore. All rights reserved.'
  });
  const [isPreview, setIsPreview] = useState(false);
  const { addNotification } = useNotification();

  const handleInputChange = (field, value) => {
    setFooterData(prev => ({ ...prev, [field]: value }));
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const response = await api.getFooter();
      const data = await response.json();
      if (data.success) {
        setFooterData(data.footer);
      }
    } catch (err) {
      console.error('Error fetching footer data:', err);
      // Keep default footer data if server is down
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.updateFooter(footerData);
      const data = await response.json();
      
      if (data.success) {
        addNotification('Footer updated successfully!', 'success');
        setFooterData(data.footer);
      } else {
        addNotification(data.message || 'Failed to update footer', 'error');
      }
    } catch (err) {
      console.error('Error updating footer:', err);
      addNotification('Failed to update footer', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-700">Edit Footer</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            {isPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isPreview ? 'Edit Mode' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#7b5fc4] text-white rounded-lg hover:bg-[#6b4fb4] transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {isPreview ? (
        <div className="bg-gray-100 text-gray-800 p-6 rounded-lg border border-gray-300">
          <div className="container mx-auto text-center space-y-4">
            <h2 className="text-2xl font-bold">Contact Us</h2>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-base">
              <p>Phone: {footerData.phone}</p>
              <span className="hidden md:inline">|</span>
              <p>Gmail: {footerData.email}</p>
              <span className="hidden md:inline">|</span>
              <p>Follow us on Instagram: {footerData.instagram}</p>
            </div>
            <div className="flex justify-center space-x-6 text-2xl">
              <a href={footerData.whatsappLink} className="text-green-600 hover:text-green-700">
                <FaWhatsapp />
              </a>
              <a href={footerData.instagramLink} className="text-pink-600 hover:text-pink-700">
                <FaInstagram />
              </a>
              <a href={`mailto:${footerData.email}`} className="text-red-600 hover:text-red-700">
                <FaEnvelope />
              </a>
              <a href={footerData.facebookLink} className="text-blue-600 hover:text-blue-700">
                <FaFacebook />
              </a>
            </div>
            <div className="text-sm text-gray-900 mt-4">
              <p>{footerData.aboutText}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              © {new Date().getFullYear()} {footerData.copyrightText}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200/50 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={footerData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={footerData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Handle
              </label>
              <input
                type="text"
                value={footerData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Link
              </label>
              <input
                type="url"
                value={footerData.whatsappLink}
                onChange={(e) => handleInputChange('whatsappLink', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Link
              </label>
              <input
                type="url"
                value={footerData.instagramLink}
                onChange={(e) => handleInputChange('instagramLink', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook Link
              </label>
              <input
                type="url"
                value={footerData.facebookLink}
                onChange={(e) => handleInputChange('facebookLink', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About Text
            </label>
            <textarea
              value={footerData.aboutText}
              onChange={(e) => handleInputChange('aboutText', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Copyright Text
            </label>
            <input
              type="text"
              value={footerData.copyrightText}
              onChange={(e) => handleInputChange('copyrightText', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EditFooter;