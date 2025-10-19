import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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

