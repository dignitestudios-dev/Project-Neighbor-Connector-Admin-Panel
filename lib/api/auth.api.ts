"use client";
import { API } from './axios';
import Cookies from 'js-cookie';

// Login API call
export const login = async (credentials: any) => {
  const response = await API.post('/auth/admin/signup', credentials);

  // Extract token from API response
  const token = response.data.data?.token;
  if (token) {
    // Save in cookie (7 days)
    Cookies.set('authToken', token, { expires: 7, sameSite: 'strict' });
  }

  console.log(response.data, 'login response');
  return response.data;
};

// Register API call
export const register = async (credentials: any) => {
  const response = await API.post('/auth/register', credentials);
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
  }
  return response.data;
};

// Logout API call
export const logout = async () => {
  try {
    await API.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always remove token locally
    localStorage.removeItem('authToken');
  }
};

// import { API } from './axios'; // your axios instance

export const forgotPassword = async (email: string) => {
  try {
    const response = await API.post('/auth/forgot', { email });
    // The API should return a message like "Password reset link sent"
    return response.data;
  } catch (error: any) {
    // Handle errors
    throw new Error(error.response?.data?.message || 'Failed to send reset link');
  }
};

export const verifyOTP = async (otp: number, email: string) => {
  try {
    const response = await API.post('/admin/auth/verifyOTP', { otp, email });
    Cookies.set('authToken', response.data.data.token, { expires: 7,});
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to verify OTP');
  }
};

export const updatePassword = async (password: string) => {
  try {
    const response = await API.post('/admin/updatePassword', { password });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update password');
  }
};

// Get current user profile
export const getProfile = async () => {
  const response = await API.get('/auth/profile');
  return response.data;
};

// Refresh token (if needed)
export const refreshToken = async () => {
  const response = await API.post('/auth/refresh');
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
  }
  return response.data;
};