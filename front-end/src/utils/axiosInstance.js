import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://localhost:5000`;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: true,
});

const shouldHandleAuthLogout = (error) => {
  const status = error.response?.status;
  if (![401, 403].includes(status)) {
    return false;
  }

  const token = localStorage.getItem('accessToken');
  if (!token) {
    return false;
  }

  const requestUrl = String(error.config?.url || '');
  if (requestUrl.includes('/api/auth/')) {
    return false;
  }

  if (status === 401) {
    return true;
  }

  const message = String(error.response?.data?.message || '').toLowerCase();
  return message.includes('khóa') || message.includes('bị khóa') || message.includes('blocked');
};

const logoutOnAuthFailure = (message) => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  toast.error(message || 'Tài khoản của bạn đã bị khóa bởi quản trị viên');

  if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    window.location.href = '/login';
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (shouldHandleAuthLogout(error)) {
      const message = error.response?.data?.message || 'Tài khoản của bạn đã bị khóa bởi quản trị viên';
      logoutOnAuthFailure(message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;