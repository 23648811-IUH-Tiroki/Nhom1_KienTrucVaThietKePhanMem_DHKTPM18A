import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://localhost:5000`;
const RATE_LIMIT_LOCK_PREFIX = 'rateLimitLock:';
const RATE_LIMIT_COUNTER_PREFIX = 'rateLimitCounter:';
const CLIENT_WINDOW_MS = 60 * 1000; // 1 minute
const CLIENT_MAX_REQUESTS = 5; // after 5 requests in window, lock

const getRequestScope = (config) => {
  const method = (config.method || 'get').toUpperCase();
  const requestUrl = new URL(config.url || '', config.baseURL || API_BASE_URL);
  return `${method}:${requestUrl.pathname}`;
};

const readLock = (scope) => {
  try {
    const rawValue = localStorage.getItem(`${RATE_LIMIT_LOCK_PREFIX}${scope}`);
    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);
    if (!parsedValue?.lockUntil || parsedValue.lockUntil <= Date.now()) {
      localStorage.removeItem(`${RATE_LIMIT_LOCK_PREFIX}${scope}`);
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
};

const storeLock = (scope, lockUntil, message) => {
  if (!lockUntil || lockUntil <= Date.now()) {
    return;
  }

  localStorage.setItem(
    `${RATE_LIMIT_LOCK_PREFIX}${scope}`,
    JSON.stringify({ lockUntil, message })
  );
};

const createRateLimitError = (config, lockData) => {
  const errorMessage = lockData?.message || 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.';

  const error = new Error(errorMessage);
  error.config = config;
  error.__rateLimitBlocked = true;
  error.response = {
    status: 429,
    statusText: 'Too Many Requests',
    data: {
      message: errorMessage,
      lockUntil: lockData?.lockUntil,
    },
    headers: {},
    config,
  };

  return error;
};

const readCounter = (scope) => {
  try {
    const raw = localStorage.getItem(`${RATE_LIMIT_COUNTER_PREFIX}${scope}`);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    // remove old timestamps
    const now = Date.now();
    const filtered = arr.filter((t) => t > now - CLIENT_WINDOW_MS);
    localStorage.setItem(`${RATE_LIMIT_COUNTER_PREFIX}${scope}`, JSON.stringify(filtered));
    return filtered;
  } catch {
    return [];
  }
};

const addCounter = (scope) => {
  try {
    const now = Date.now();
    const arr = readCounter(scope);
    arr.push(now);
    localStorage.setItem(`${RATE_LIMIT_COUNTER_PREFIX}${scope}`, JSON.stringify(arr));
    return arr.length;
  } catch {
    return 0;
  }
};

const extractLockFromResponse = (error) => {
  const response = error.response;
  if (!response) {
    return null;
  }

  const lockUntilFromBody = Number(response.data?.lockUntil || 0);
  if (lockUntilFromBody > Date.now()) {
    return {
      lockUntil: lockUntilFromBody,
      message: response.data?.message,
    };
  }

  const retryAfterSeconds = Number(
    response.data?.retryAfterSeconds || response.headers?.['retry-after'] || 0
  );
  if (retryAfterSeconds > 0) {
    return {
      lockUntil: Date.now() + retryAfterSeconds * 1000,
      message: response.data?.message,
    };
  }

  return null;
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: true,
});

const shouldHandleAuthLogout = (error) => {
  if (error.response?.status !== 401) {
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

  return true;
};

// Add JWT token to request headers
axiosInstance.interceptors.request.use(
  (config) => {
    const scope = getRequestScope(config);
    const lockData = readLock(scope);
    if (lockData) {
      toast.error(lockData.message || 'Bạn đang tạm thời bị giới hạn gửi yêu cầu.');
      return Promise.reject(createRateLimitError(config, lockData));
    }

    const method = (config.method || 'get').toLowerCase();
    if (method !== 'get') {
      // Client-side rate limiting: count requests per scope and lock if exceed threshold
      const currentCount = addCounter(scope);
      if (currentCount > CLIENT_MAX_REQUESTS) {
        // lock for remaining window
        const lockUntil = Date.now() + CLIENT_WINDOW_MS;
        const message = 'Bạn đã gọi quá nhiều lần trong 1 phút. Vui lòng thử lại sau.';
        storeLock(scope, lockUntil, message);
        toast.error(message);
        return Promise.reject(createRateLimitError(config, { lockUntil, message }));
      }
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
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
    if (error.__rateLimitBlocked) {
      return Promise.reject(error);
    }

    if (error.response?.status === 429) {
      const lockData = extractLockFromResponse(error);
      if (lockData) {
        const scope = getRequestScope(error.config || {});
        storeLock(scope, lockData.lockUntil, lockData.message);
      }

      toast.error(
        error.response?.data?.message ||
        'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.'
      );
    }

    if (shouldHandleAuthLogout(error)) {
      // Token expired or invalid - only redirect if not already on login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;