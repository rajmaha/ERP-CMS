import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 30000
});

// Request interceptor
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      } else if (status === 403) {
        toast.error('Access denied');
      } else if (status === 404) {
        toast.error('Resource not found');
      } else if (status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      // Request made but no response
      toast.error('No response from server. Check your connection.');
    } else {
      // Other errors
      toast.error(error.message || 'An error occurred');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
