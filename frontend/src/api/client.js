import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  signup: (userData) => apiClient.post('/auth/signup', userData),
  getMe: () => apiClient.get('/auth/me'),
};

export const categoriesAPI = {
  getAll: () => apiClient.get('/categories'),
};

export const productsAPI = {
  getAll: (params) => apiClient.get('/products', { params }),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (productData) => apiClient.post('/products', productData),
  getMyProducts: () => apiClient.get('/products/vendor/my-products'),
};

export const cartAPI = {
  get: () => apiClient.get('/cart'),
  add: (item) => apiClient.post('/cart/add', item),
  remove: (itemId) => apiClient.delete(`/cart/${itemId}`),
};

export const ordersAPI = {
  create: (orderData) => apiClient.post('/orders', orderData),
  getMyOrders: () => apiClient.get('/orders'),
  getById: (id) => apiClient.get(`/orders/${id}`),
  getVendorOrders: () => apiClient.get('/orders/vendor/my-orders'),
  updateStatus: (id, status) => apiClient.patch(`/orders/${id}/status`, null, { params: { status } }),
};

export const vendorsAPI = {
  signup: (vendorData) => apiClient.post('/vendors/signup', vendorData),
  getById: (id) => apiClient.get(`/vendors/${id}`),
  getMyProfile: () => apiClient.get('/vendors/me/profile'),
};

export const adminAPI = {
  getPendingVendors: () => apiClient.get('/admin/vendors/pending'),
  verifyVendor: (id, approved) => apiClient.patch(`/admin/vendors/${id}/verify`, null, { params: { approved } }),
};

export default apiClient;