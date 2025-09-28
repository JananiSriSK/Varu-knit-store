import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Star,
  Heart,
  RotateCcw,
  Edit3,
  X,
  Plus,
  Trash2,
  MapPin,
} from "lucide-react";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";

const PersonalDetails = ({ user }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [stats, setStats] = useState({ orders: 0, reviews: 0, wishlist: 0, returns: 0 });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    address: user?.address || ''
  });
  const [addressFormData, setAddressFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pinCode: '',
    phoneNo: '',
    isDefault: false
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
      fetchAddresses();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
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
      
      const orderCount = ordersData.success ? ordersData.orders.length : 0;
      const wishlistCount = wishlistData.success ? wishlistData.wishlist.length : 0;
      
      // Count reviews from delivered orders
      let reviewCount = 0;
      if (ordersData.success) {
        ordersData.orders.forEach(order => {
          if (order.orderStatus === 'Delivered') {
            reviewCount += order.orderItems.length; // Each item can have a review
          }
        });
      }
      
      console.log('📊 User Stats:', { orderCount, wishlistCount, reviewCount });
      
      setStats({
        orders: orderCount,
        reviews: reviewCount,
        wishlist: wishlistCount,
        returns: 0 // TODO: Implement returns count
      });
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await api.getAddresses();
      const data = await response.json();
      if (data.success) {
        setAddresses(data.addresses);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
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
      const response = await api.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender
      });
      const data = await response.json();
      if (data.success) {
        addNotification('Profile updated successfully!', 'success');
        setIsEditModalOpen(false);
        // Update local state with new user data
        window.location.reload(); // Refresh to get updated user data
      } else {
        addNotification(data.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      addNotification('Failed to update profile', 'error');
    }
  };

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingAddress) {
        response = await api.updateAddress(editingAddress._id, addressFormData);
      } else {
        response = await api.addAddress(addressFormData);
      }
      
      const data = await response.json();
      if (data.success) {
        setAddresses(data.addresses);
        addNotification(editingAddress ? 'Address updated successfully' : 'Address added successfully', 'success');
        handleCloseAddressModal();
      } else {
        addNotification(data.message || 'Failed to save address', 'error');
      }
    } catch (err) {
      addNotification('Failed to save address', 'error');
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressFormData({
      name: address.name,
      address: address.address,
      city: address.city,
      state: address.state,
      country: address.country,
      pinCode: address.pinCode,
      phoneNo: address.phoneNo,
      isDefault: address.isDefault
    });
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const response = await api.deleteAddress(addressId);
      const data = await response.json();
      if (data.success) {
        setAddresses(data.addresses);
        addNotification('Address deleted successfully', 'success');
      }
    } catch (err) {
      addNotification('Failed to delete address', 'error');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await api.setDefaultAddress(addressId);
      const data = await response.json();
      if (data.success) {
        setAddresses(data.addresses);
        addNotification('Default address updated', 'success');
      }
    } catch (err) {
      addNotification('Failed to update default address', 'error');
    }
  };

  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
    setAddressFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      pinCode: '',
      phoneNo: '',
      isDefault: false
    });
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
            <span className="font-semibold">Name:</span> {user?.name || 'Not provided'}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {user?.email || 'Not provided'}
          </div>
          <div>
            <span className="font-semibold">Mobile:</span> {user?.phone || 'Not provided'}
          </div>
          <div>
            <span className="font-semibold">Gender:</span> {user?.gender || 'Not provided'}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
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

      {/* Address Management Section */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#444]">My Addresses</h3>
            <p className="text-sm text-gray-500">
              Manage your delivery addresses
            </p>
          </div>
          <button
            onClick={() => setShowAddressModal(true)}
            className="flex items-center gap-2 bg-[#A084CA] text-white px-3 py-1.5 rounded-lg hover:bg-[#8B6BB1] cursor-pointer text-sm"
          >
            <Plus className="h-4 w-4" />
            Add Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No addresses saved. Add your first address to get started.
          </div>
        ) : (
          <div className="grid gap-3">
            {addresses.map((address) => (
              <div key={address._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-[#A084CA]" />
                      <span className="font-medium text-sm">{address.name}</span>
                      {address.isDefault && (
                        <span className="bg-[#A084CA] text-white text-xs px-2 py-1 rounded">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {address.address}, {address.city}, {address.state} - {address.pinCode}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.country} | Phone: {address.phoneNo}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(address._id)}
                        className="text-xs text-[#A084CA] hover:underline cursor-pointer"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="text-[#A084CA] hover:text-[#8B6BB1] cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address._id)}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

      {/* Add/Edit Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg relative">
            <button
              onClick={handleCloseAddressModal}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
            >
              <X className="h-6 w-6 cursor-pointer" />
            </button>
            
            <h3 className="text-lg font-semibold mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={addressFormData.name}
                onChange={handleAddressInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A084CA]"
              />
              
              <textarea
                name="address"
                placeholder="Address"
                value={addressFormData.address}
                onChange={handleAddressInputChange}
                required
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A084CA]"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={addressFormData.city}
                  onChange={handleAddressInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A084CA]"
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={addressFormData.state}
                  onChange={handleAddressInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A084CA]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={addressFormData.country}
                  onChange={handleAddressInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A084CA]"
                />
                <input
                  type="text"
                  name="pinCode"
                  placeholder="Pin Code"
                  value={addressFormData.pinCode}
                  onChange={handleAddressInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A084CA]"
                />
              </div>
              
              <input
                type="tel"
                name="phoneNo"
                placeholder="Phone Number"
                value={addressFormData.phoneNo}
                onChange={handleAddressInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A084CA]"
              />
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={addressFormData.isDefault}
                  onChange={handleAddressInputChange}
                  className="rounded"
                />
                <span className="text-sm">Set as default address</span>
              </label>

              <button
                type="submit"
                className="w-full bg-[#A084CA] text-white py-2 rounded-lg hover:bg-[#8B6BB1] cursor-pointer"
              >
                {editingAddress ? 'Update Address' : 'Add Address'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalDetails;
