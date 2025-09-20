const API_BASE = 'http://localhost:5000/api/v1';

const api = {
  // Auth endpoints
  register: (userData) => 
    fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }),

  login: (credentials) =>
    fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }),

  logout: () =>
    fetch(`${API_BASE}/logout`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),

  getProfile: () =>
    fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),

  updateProfile: (userData) =>
    fetch(`${API_BASE}/me/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(userData)
    }),

  updatePassword: (passwordData) =>
    fetch(`${API_BASE}/password/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(passwordData)
    }),

  forgotPassword: (emailData) =>
    fetch(`${API_BASE}/password/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    }),

  resetPassword: (token, passwords) =>
    fetch(`${API_BASE}/password/reset/${token}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(passwords)
    }),

  // Product endpoints
  getProducts: (params = '') =>
    fetch(`${API_BASE}/products${params}`),

  getAdminProducts: () =>
    fetch(`${API_BASE}/admin/products`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),

  getProduct: (id) =>
    fetch(`${API_BASE}/product/${id}`),

  getSubcategories: (category) =>
    fetch(`${API_BASE}/subcategories?category=${category}`),

  createReview: (reviewData) =>
    fetch(`${API_BASE}/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(reviewData)
    }),

  // Order endpoints
  createOrder: (orderData) =>
    fetch(`${API_BASE}/order/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(orderData)
    }),

  getMyOrders: () =>
    fetch(`${API_BASE}/orders/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),

  getOrder: (id) =>
    fetch(`${API_BASE}/order/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),

  // Admin endpoints
  getAllUsers: () =>
    fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),

  deleteUser: (id) =>
    fetch(`${API_BASE}/admin/user/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),

  getAllOrders: () =>
    fetch(`${API_BASE}/admin/orders`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),

  updateOrderStatus: (id, status) =>
    fetch(`${API_BASE}/admin/order/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status })
    }),

  createProduct: (formData) =>
    fetch(`${API_BASE}/admin/product/new`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    }),

  updateProduct: (id, formData) =>
    fetch(`${API_BASE}/admin/product/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    }),

  deleteProduct: (id) =>
    fetch(`${API_BASE}/admin/product/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),

  // Wishlist endpoints
  getWishlist: () =>
    fetch(`${API_BASE}/wishlist`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),

  addToWishlist: (productId) =>
    fetch(`${API_BASE}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ productId })
    }),

  removeFromWishlist: (productId) =>
    fetch(`${API_BASE}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),

  // Content management endpoints
  getHomepage: () =>
    fetch(`${API_BASE}/homepage`),

  updateHomepage: (formData) =>
    fetch(`${API_BASE}/admin/homepage`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: formData
    }),

  getFooter: () =>
    fetch(`${API_BASE}/footer`),

  updateFooter: (footerData) =>
    fetch(`${API_BASE}/admin/footer`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(footerData)
    }),

  // Notification endpoints
  getNotifications: () =>
    fetch(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),

  markNotificationRead: (id) =>
    fetch(`${API_BASE}/notification/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),

  markAllNotificationsRead: () =>
    fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),

  // OTP endpoints
  sendOTP: (userData) =>
    fetch(`${API_BASE}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }),

  verifyOTP: (otpData) =>
    fetch(`${API_BASE}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(otpData)
    }),

  resetPasswordWithOTP: (otpData) =>
    fetch(`${API_BASE}/reset-password-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(otpData)
    }),

  // Address endpoints
  getAddresses: () =>
    fetch(`${API_BASE}/addresses`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),

  addAddress: (addressData) =>
    fetch(`${API_BASE}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(addressData)
    }),

  updateAddress: (addressId, addressData) =>
    fetch(`${API_BASE}/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(addressData)
    }),

  deleteAddress: (addressId) =>
    fetch(`${API_BASE}/addresses/${addressId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),

  setDefaultAddress: (addressId) =>
    fetch(`${API_BASE}/addresses/${addressId}/default`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),

  // AI/ML endpoints
  getRecommendations: (productId) =>
    fetch(`${API_BASE}/recommendations/${productId}`),

  getPersonalizedRecommendations: () =>
    fetch(`${API_BASE}/recommendations/personalized`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),

  smartSearch: (query, category = '') =>
    fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}&category=${category}`),

  getSearchSuggestions: (query) =>
    fetch(`${API_BASE}/search/suggestions?query=${encodeURIComponent(query)}`),

  chatbot: (message, userId = null) =>
    fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, userId })
    }),

  getFAQ: () =>
    fetch(`${API_BASE}/faq`),

  // Favorite Collections endpoints
  getFavoriteCollections: () =>
    fetch(`${API_BASE}/favorite-collections`),

  setFavoriteCollections: (productIds) =>
    fetch(`${API_BASE}/admin/favorite-collections`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ productIds })
    })
};

export default api;