import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Star,
  Heart,
  RotateCcw,
  Edit3,
  X,
} from "lucide-react";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";

const PersonalDetails = ({ user }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [stats, setStats] = useState({ orders: 0, reviews: 0, wishlist: 0, returns: 0 });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    address: user?.address || ''
  });
  const { addNotification } = useNotification();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        address: user.address || ''
      });
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const [ordersRes, wishlistRes] = await Promise.all([
        api.getMyOrders(),
        api.getWishlist()
      ]);
      
      const [ordersData, wishlistData] = await Promise.all([
        ordersRes.json(),
        wishlistRes.json()
      ]);
      
      setStats({
        orders: ordersData.success ? ordersData.orders.length : 0,
        reviews: 0, // TODO: Implement reviews count
        wishlist: wishlistData.success ? wishlistData.wishlist.length : 0,
        returns: 0 // TODO: Implement returns count
      });
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement profile update API
      addNotification('Profile updated successfully!', 'success');
      setIsEditModalOpen(false);
    } catch (err) {
      addNotification('Failed to update profile', 'error');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-gray-50">
      {/* Profile Section */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#444]">My Profile</h3>
            <p className="text-sm text-gray-500">
              Manage your personal information
            </p>
          </div>
          <button
            onClick={handleEditClick}
            className="flex items-center gap-1 rounded-lg bg-[#fceeee] px-3 py-1.5 text-sm text-[#D97878] hover:bg-[#FCE8E8]"
          >
            <Edit3 className="h-4 w-4 cursor-pointer" />
            Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <span className="font-semibold">Name:</span> {formData.name || 'Not provided'}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {formData.email || 'Not provided'}
          </div>
          <div>
            <span className="font-semibold">Mobile:</span> {formData.phone || 'Not provided'}
          </div>
          <div>
            <span className="font-semibold">Gender:</span> {formData.gender || 'Not provided'}
          </div>
          <div className="col-span-2">
            <span className="font-semibold">Address:</span> {formData.address || 'Not provided'}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { icon: ShoppingCart, label: "Orders", value: stats.orders },
          { icon: Star, label: "Reviews", value: stats.reviews },
          { icon: Heart, label: "Wishlist", value: stats.wishlist },
          { icon: RotateCcw, label: "Returns", value: stats.returns },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3 text-gray-700">
              <item.icon className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <span className="text-sm font-semibold">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg relative">
            <button
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
              onClick={handleCloseModal}
            >
              <X className="h-6 w-6 cursor-pointer" />
            </button>
            <h3 className="mb-4 text-lg font-semibold text-[#444] ">
              Edit Profile
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Name*
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Email*
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#7b5fc4] focus:border-transparent"
                    rows="3"
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-[#D97878] px-4 py-2 text-sm text-white hover:bg-[#c56767] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalDetails;
