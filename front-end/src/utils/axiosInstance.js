import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const TOO_MANY_REQUESTS_TOAST_ID = 'rate-limit-toast';

const clearAuthStorage = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// Add JWT token to request headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      // Token expired or invalid - only redirect if not already on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        clearAuthStorage();
        window.location.href = '/login';
      }
    }

    if (status === 429 && !toast.isActive(TOO_MANY_REQUESTS_TOAST_ID)) {
      toast.error('Bạn thao tác quá nhanh, vui lòng thử lại sau', {
        toastId: TOO_MANY_REQUESTS_TOAST_ID,
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
