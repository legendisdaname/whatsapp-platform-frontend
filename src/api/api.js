import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://whatsapp-platform-backend.onrender.com';

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

