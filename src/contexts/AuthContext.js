import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Auto-detect production vs development
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = process.env.REACT_APP_API_URL || (isLocalhost ? 'http://localhost:5000' : 'https://whatsapp-platform-backend.onrender.com');

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and restore session
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Sign up with email
  const signUp = async (email, password, name) => {
    const response = await axios.post(`${API_URL}/api/auth/signup`, {
      email,
      password,
      name
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    // Store token and user
    localStorage.setItem('authToken', response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  // Sign in with email
  const signIn = async (email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    // Store token and user
    localStorage.setItem('authToken', response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    // Get Google auth URL from backend
    const response = await axios.get(`${API_URL}/api/auth/google`);
    
    if (response.data.success) {
      // Redirect to Google OAuth
      window.location.href = response.data.url;
    } else {
      throw new Error('Failed to initiate Google login');
    }
  };

  // Handle Google OAuth callback
  const handleGoogleCallback = async (code) => {
    try {
      console.log('Calling backend at:', `${API_URL}/api/auth/google/callback`);
      
      const response = await axios.post(`${API_URL}/api/auth/google/callback`, {
        code
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      // Store token and user
      localStorage.setItem('authToken', response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      console.error('Google callback error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    await axios.post(`${API_URL}/api/auth/logout`);
    localStorage.removeItem('authToken');
    setUser(null);
  };

  // Reset password (simplified for backend implementation)
  const resetPassword = async (email) => {
    // This would typically send an email via your backend
    const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
      email
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  };

  // Update password
  const updatePassword = async (newPassword) => {
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${API_URL}/api/auth/update-password`, {
      newPassword
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    handleGoogleCallback,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

