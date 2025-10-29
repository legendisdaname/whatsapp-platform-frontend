/**
 * API Configuration for Supabase Edge Function
 */

export const SUPABASE_CONFIG = {
  URL: 'https://iablyrggxgwmyqbzthuk.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhYmx5cmdneGd3bXlxYnp0aHVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3Mjc1NjAsImV4cCI6MjA3NjMwMzU2MH0.3Aqz08VQlIVedfUwa6zz3g-_qrWbGU05WJM7Jbccu4Q',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Public endpoints
  HEALTH: '/health',
  ROOT: '/',
  
  // Protected endpoints
  SESSIONS: '/api/sessions',
  MESSAGES: '/api/messages',
  BOTS: '/api/bots',
  CONTACTS: '/api/contacts',
  WOOCOMMERCE: '/api/woocommerce',
};

// Base API URL
export const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Use Supabase Edge Function
  return `${SUPABASE_CONFIG.URL}/functions/v1/whatsapp-backend`;
};

// Get authentication headers
export const getAuthHeaders = () => {
  return {
    'Authorization': `Bearer ${SUPABASE_CONFIG.ANON_KEY}`,
    'apikey': SUPABASE_CONFIG.ANON_KEY,
    'Content-Type': 'application/json'
  };
};

export default {
  SUPABASE_CONFIG,
  API_ENDPOINTS,
  getApiBaseUrl,
  getAuthHeaders
};
