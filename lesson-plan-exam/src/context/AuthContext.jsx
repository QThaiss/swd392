import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/account/profile');
      if (res.success) {
        setUser(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/account/login', { email, password });
      if (response.success) {
        const { accessToken, user } = response.data;
        setToken(accessToken);
        setUser(user);
        localStorage.setItem('token', accessToken);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const registerStudent = async (data) => {
    try {
      const response = await api.post('/account/register-student', data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const registerTeacher = async (data) => {
    try {
      const response = await api.post('/account/register-teacher', data);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const verifyAccount = async (email, otp) => {
    try {
      const response = await api.post('/account/verify-account', { email, otp });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    login,
    logout,
    registerStudent,
    registerTeacher,
    verifyAccount,
    loading,
    refreshProfile: fetchProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
