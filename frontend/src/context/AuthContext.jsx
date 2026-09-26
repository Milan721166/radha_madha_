import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('radhamav_token') || null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/profile');
      if (res.success) {
        setUser(res.user);
        setAddresses(res.addresses || []);
      }
    } catch (err) {
      console.error('Fetch profile error:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success) {
      localStorage.setItem('radhamav_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
  };

  const register = async (name, email, password, phone) => {
    const res = await api.post('/auth/register', { name, email, password, phone });
    if (res.success) {
      localStorage.setItem('radhamav_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
  };

  const logout = () => {
    localStorage.removeItem('radhamav_token');
    setToken(null);
    setUser(null);
    setAddresses([]);
  };

  const saveAddress = async (addressData) => {
    const res = await api.post('/auth/addresses', addressData);
    if (res.success) {
      setAddresses(res.addresses);
      return res;
    }
  };

  const deleteAddress = async (id) => {
    const res = await api.delete(`/auth/addresses/${id}`);
    if (res.success) {
      setAddresses(res.addresses);
      return res;
    }
  };

  const loginWithOtp = async (phone, otp, name) => {
    const res = await api.post('/auth/login-otp', { phone, otp, name });
    if (res.success) {
      localStorage.setItem('radhamav_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
  };

  const sendOtp = async (phone) => {
    return await api.post('/auth/send-otp', { phone });
  };

  const verifyOtp = async (phone, otp) => {
    return await api.post('/auth/verify-otp', { phone, otp });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        addresses,
        isAdmin: user?.role === 'admin',
        login,
        register,
        loginWithOtp,
        sendOtp,
        verifyOtp,
        logout,
        fetchProfile,
        saveAddress,
        deleteAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
