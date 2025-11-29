import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

// Helper function to get auth headers
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

// Helper function to create axios config
const createConfig = (method = 'GET', data = null, headers = {}) => {
  const config = {
    method,
    headers: {
      ...headers
    }
  };
  
  // For FormData, axios will set Content-Type automatically, so we don't set it
  // For JSON data, axios sets Content-Type automatically, but we can be explicit
  if (data instanceof FormData) {
    config.data = data;
  } else if (data !== null) {
    config.data = data;
    if (method !== 'GET') {
      config.headers['Content-Type'] = 'application/json';
    }
  }
  
  return config;
};

// Helper to wrap axios response to be compatible with fetch API
const wrapResponse = (axiosPromise) => {
  return axiosPromise
    .then(response => ({
      json: () => Promise.resolve(response.data),
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      headers: response.headers
    }))
    .catch(error => {
      // Handle axios errors - convert to fetch-like response
      if (error.response) {
        // Server responded with error status
        return Promise.resolve({
          json: () => Promise.resolve(error.response.data),
          ok: false,
          status: error.response.status,
          headers: error.response.headers
        });
      }
      // Network error or other
      throw error;
    });
};

const api = {
  // Auth endpoints
  register: (userData) => 
    wrapResponse(axios(`${API_BASE}/register`, createConfig('POST', userData))),

  login: (credentials) =>
    wrapResponse(axios(`${API_BASE}/login`, createConfig('POST', credentials))),

  logout: () =>
    wrapResponse(axios(`${API_BASE}/logout`, {
      ...createConfig('GET'),
      headers: getAuthHeaders()
    })),

  getProfile: () =>
    wrapResponse(axios(`${API_BASE}/me`, {
      ...createConfig('GET'),
      headers: getAuthHeaders()
    })),

  updateProfile: (userData) =>
    wrapResponse(axios(`${API_BASE}/me/update`, {
      ...createConfig('PUT', userData),
      headers: getAuthHeaders()
    })),

  updatePassword: (passwordData) =>
    wrapResponse(axios(`${API_BASE}/password/update`, {
      ...createConfig('PUT', passwordData),
      headers: getAuthHeaders()
    })),

  forgotPassword: (emailData) =>
    wrapResponse(axios(`${API_BASE}/password/forgot`, createConfig('POST', emailData))),

  resetPassword: (token, passwords) =>
    wrapResponse(axios(`${API_BASE}/password/reset/${token}`, createConfig('PUT', passwords))),

  // Product endpoints
  getProducts: (params = '') =>
    wrapResponse(axios(`${API_BASE}/products${params}`, createConfig('GET'))),

  getAdminProducts: () =>
    wrapResponse(axios(`${API_BASE}/admin/products`, {
      ...createConfig('GET'),
      headers: getAuthHeaders()
    })),

  getProduct: (id) =>
    wrapResponse(axios(`${API_BASE}/product/${id}`, createConfig('GET'))),

  getSubcategories: (category) =>
    wrapResponse(axios(`${API_BASE}/subcategories?category=${category}`, createConfig('GET'))),

  createReview: (reviewData) =>
    wrapResponse(axios(`${API_BASE}/review`, {
      ...createConfig('PUT', reviewData),
      headers: getAuthHeaders()
    })),

  deleteReview: (productId, reviewId) =>
    wrapResponse(axios(`${API_BASE}/admin/reviews?productId=${productId}&id=${reviewId}`, {
      ...createConfig('DELETE'),
      headers: getAuthHeaders()
    })),

  // Order endpoints
  createOrder: (orderData) =>
    wrapResponse(axios(`${API_BASE}/order/new`, {
      ...createConfig('POST', orderData),
      headers: getAuthHeaders()
    })),

  getMyOrders: () =>
    wrapResponse(axios(`${API_BASE}/orders/me`, {
      ...createConfig('GET'),
      headers: getAuthHeaders()
    })),

  getOrder: (id) =>
    wrapResponse(axios(`${API_BASE}/order/${id}`, {
      ...createConfig('GET'),
      headers: getAuthHeaders()
    })),

  // Admin endpoints
  getAllUsers: () =>
    wrapResponse(axios(`${API_BASE}/admin/users`, {
      ...createConfig('GET'),
      headers: getAuthHeaders()
    })),

  deleteUser: (id) =>
    wrapResponse(axios(`${API_BASE}/admin/user/${id}`, {
      ...createConfig('DELETE'),
      headers: getAuthHeaders()
    })),

  getAllOrders: () =>
    wrapResponse(axios(`${API_BASE}/admin/orders`, {
      ...createConfig('GET'),
      headers: getAuthHeaders()
    })),

  updateOrderStatus: (id, status) =>
    wrapResponse(axios(`${API_BASE}/admin/order/${id}`, {
      ...createConfig('PUT', { status }),
      headers: getAuthHeaders()
    })),

  createProduct: (formData) =>
    wrapResponse(axios(`${API_BASE}/admin/product/new`, {
      method: 'POST',
      headers: getAuthHeaders(),
      data: formData
    })),

  updateProduct: (id, formData) =>
    wrapResponse(axios(`${API_BASE}/admin/product/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      data: formData
    })),

  deleteProduct: (id) =>
    wrapResponse(axios(`${API_BASE}/admin/product/${id}`, {
      ...createConfig('DELETE'),
      headers: getAuthHeaders()
    })),

  // Wishlist endpoints
  getWishlist: () =>
    wrapResponse(axios(`${API_BASE}/wishlist`, {
      ...createConfig('GET'),
      headers: getAuthHeaders()
    })),

  addToWishlist: (productId) =>
    wrapResponse(axios(`${API_BASE}/wishlist`, {
      ...createConfig('POST', { productId }),
      headers: getAuthHeaders()
    })),

  removeFromWishlist: (productId) =>
    wrapResponse(axios(`${API_BASE}/wishlist/${productId}`, {
      ...createConfig('DELETE'),
      headers: getAuthHeaders()
    })),

  // Content management endpoints
  getHomepage: () =>
    wrapResponse(axios(`${API_BASE}/homepage`, createConfig('GET'))),

  updateHomepage: (formData) =>
    wrapResponse(axios(`${API_BASE}/admin/homepage`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      data: formData
    })),

  getFooter: () =>
    wrapResponse(axios(`${API_BASE}/footer`, createConfig('GET'))),

  updateFooter: (footerData) =>
    wrapResponse(axios(`${API_BASE}/admin/footer`, {
      ...createConfig('PUT', footerData),
      headers: getAuthHeaders()
    })),

  // Notification endpoints
  getNotifications: () =>
    wrapResponse(axios(`${API_BASE}/notifications`, {
      ...createConfig('GET'),
      headers: getAuthHeaders()
    })),

  markNotificationRead: (id) =>
    wrapResponse(axios(`${API_BASE}/notification/${id}/read`, {
      ...createConfig('PUT'),
      headers: getAuthHeaders()
    })),

  markAllNotificationsRead: () =>
    wrapResponse(axios(`${API_BASE}/notifications/read-all`, {
      ...createConfig('PUT'),
      headers: getAuthHeaders()
    })),

  // OTP endpoints
  sendOTP: (userData) =>
    wrapResponse(axios(`${API_BASE}/send-otp`, createConfig('POST', userData))),

  verifyOTP: (otpData) =>
    wrapResponse(axios(`${API_BASE}/verify-otp`, createConfig('POST', otpData))),

  resetPasswordWithOTP: (otpData) =>
    wrapResponse(axios(`${API_BASE}/reset-password-otp`, createConfig('POST', otpData))),

  // Address endpoints
  getAddresses: () =>
    wrapResponse(axios(`${API_BASE}/addresses`, {
      ...createConfig('GET'),
      headers: getAuthHeaders()
    })),

  addAddress: (addressData) =>
    wrapResponse(axios(`${API_BASE}/addresses`, {
      ...createConfig('POST', addressData),
      headers: getAuthHeaders()
    })),

  updateAddress: (addressId, addressData) =>
    wrapResponse(axios(`${API_BASE}/addresses/${addressId}`, {
      ...createConfig('PUT', addressData),
      headers: getAuthHeaders()
    })),

  deleteAddress: (addressId) =>
    wrapResponse(axios(`${API_BASE}/addresses/${addressId}`, {
      ...createConfig('DELETE'),
      headers: getAuthHeaders()
    })),

  setDefaultAddress: (addressId) =>
    wrapResponse(axios(`${API_BASE}/addresses/${addressId}/default`, {
      ...createConfig('PUT'),
      headers: getAuthHeaders()
    })),

  // AI/ML endpoints
  getRecommendations: (productId) =>
    wrapResponse(axios(`${API_BASE}/recommendations/${productId}`, createConfig('GET'))),

  getPersonalizedRecommendations: () =>
    wrapResponse(axios(`${API_BASE}/recommendations/personalized`, {
      ...createConfig('GET'),
      headers: getAuthHeaders()
    })),

  smartSearch: (query, category = '') =>
    wrapResponse(axios(`${API_BASE}/search?query=${encodeURIComponent(query)}&category=${category}`, createConfig('GET'))),

  getSearchSuggestions: (query) =>
    wrapResponse(axios(`${API_BASE}/search/suggestions?query=${encodeURIComponent(query)}`, createConfig('GET'))),

  chatbot: (message, userId = null) =>
    wrapResponse(axios(`http://localhost:5001/chat`, createConfig('POST', { message, userId }))),

  getFAQ: () =>
    wrapResponse(axios(`${API_BASE}/faq`, createConfig('GET'))),

  // Favorite Collections endpoints
  getFavoriteCollections: () =>
    wrapResponse(axios(`${API_BASE}/favorite-collections`, createConfig('GET'))),

  setFavoriteCollections: (productIds) =>
    wrapResponse(axios(`${API_BASE}/admin/favorite-collections`, {
      ...createConfig('PUT', { productIds }),
      headers: getAuthHeaders()
    })),

  // Latest Collections endpoints
  getLatestCollections: () =>
    wrapResponse(axios(`${API_BASE}/latest-collections`, createConfig('GET'))),

  setLatestCollections: (productIds) =>
    wrapResponse(axios(`${API_BASE}/admin/latest-collections`, {
      ...createConfig('PUT', { productIds }),
      headers: getAuthHeaders()
    })),

  // Payment Settings endpoints
  getPaymentSettings: () =>
    wrapResponse(axios(`${API_BASE}/payment-settings`, createConfig('GET'))),

  updatePaymentSettings: (settingsData) =>
    wrapResponse(axios(`${API_BASE}/admin/payment-settings`, {
      ...createConfig('PUT', settingsData),
      headers: getAuthHeaders()
    }))
};

export default api;
