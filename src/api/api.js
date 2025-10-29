import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://whatsapp-platform-backend.onrender.com');

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        isNetworkError: true
      });
    }

    // Handle authentication errors
    if (error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject({
        message: 'Session expired. Please log in again.',
        isAuthError: true
      });
    }

    // Handle server errors
    if (error.response.status >= 500) {
      console.error('Server Error:', error.response.data);
      return Promise.reject({
        message: 'Server error. Please try again later.',
        isServerError: true,
        status: error.response.status
      });
    }

    // Handle other errors
    return Promise.reject({
      message: error.response.data?.message || error.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data
    });
  }
);

// Session API
export const sessionAPI = {
  getAll: () => api.get('/api/sessions'),
  getById: (id) => api.get(`/api/sessions/${id}`),
  create: (sessionName) => api.post('/api/sessions', { sessionName }),
  delete: (id) => api.delete(`/api/sessions/${id}`)
};

// Message API
export const messageAPI = {
  send: (sessionId, to, message) => 
    api.post('/api/messages/send', { sessionId, to, message }),
  getHistory: (sessionId, limit = 50) => 
    api.get(`/api/messages/history/${sessionId}?limit=${limit}`),
  getReceived: (sessionId, limit = 50) => 
    api.get(`/api/messages/received/${sessionId}?limit=${limit}`)
};

// Bot API
export const botAPI = {
  getAll: () => api.get('/api/bots'),
  getById: (id) => api.get(`/api/bots/${id}`),
  getBySession: (sessionId) => api.get(`/api/bots/session/${sessionId}`),
  create: (botData) => api.post('/api/bots', botData),
  update: (id, updates) => api.put(`/api/bots/${id}`, updates),
  delete: (id) => api.delete(`/api/bots/${id}`),
  trigger: (id) => api.post(`/api/bots/${id}/trigger`)
};

export default api;

