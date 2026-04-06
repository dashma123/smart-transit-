import axios from 'axios';

// Base API URL
const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
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

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================
export const authAPI = {
  signup: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// ==================== WALLET APIs ====================
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  initiateTopup: (amount) => api.post('/wallet/topup/initiate', { amount }),
  verifyTopup: (pidx) => api.post('/wallet/topup/verify', { pidx }),
  getTransactions: () => api.get('/wallet/transactions'),
  deductFare: (amount, description) => 
    api.post('/wallet/deduct', { amount, description }),
};

// ==================== RFID APIs ====================
export const rfidAPI = {
  linkCard: (cardId) => api.post('/rfid/link', { card_id: cardId }),
  getCardDetails: () => api.get('/rfid/details'),
  toggleCardStatus: (action) => api.post('/rfid/toggle-status', { action }),
  simulateTap: (cardId, fareAmount = 18) => 
    api.post('/rfid/tap', { card_id: cardId, fare_amount: fareAmount }),
};

// ==================== KHALTI APIs ====================
export const khaltiAPI = {
  initiatePayment: (amount, orderId, customer) => 
    api.post('/khalti/initiate', { amount, orderId, customer }),
  verifyPayment: (pidx) => api.post('/khalti/verify', { pidx }),
};

// ==================== DRIVER APIs ====================
export const driverAPI = {
  recordStop: (stopData) => api.post('/driver/record-stop', stopData),
  getStops: () => api.get('/driver/stops'),
  getStats: () => api.get('/driver/stats'),
};

// ==================== ADMIN APIs ====================
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getTransactions: () => api.get('/admin/transactions'),
  getLowBalanceUsers: () => api.get('/admin/low-balance-users'),
  sendAlert: (userId) => api.post('/admin/send-alert', { userId }),
};

// ==================== REPORT APIs ====================
export const reportAPI = {
  getFinancialReport: (type) => api.get(`/reports/financial?type=${type}`),  // FIXED: Proper template literal
  getCollectionReport: (days) => api.get(`/reports/collection?days=${days}`),  // FIXED: Proper template literal
};

export default api;