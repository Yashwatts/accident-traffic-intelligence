/**
 * Enhanced API Client with Security Features
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Request deduplication
 * - Rate limiting awareness
 * - CSRF protection
 * - Request validation
 */

import axios from 'axios';
import { storage } from './utils';
import { ClientRateLimiter, generateCSRFToken, sanitizeInput } from './securityUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Include cookies for CSRF
});

// Rate limiter for client-side requests
const rateLimiter = new ClientRateLimiter(100, 60000); // 100 requests per minute

// Pending requests map for deduplication
const pendingRequests = new Map();

// CSRF token storage
let csrfToken = generateCSRFToken();

/**
 * Request Interceptor
 */
apiClient.interceptors.request.use(
  async (config) => {
    // Client-side rate limiting check
    if (!rateLimiter.canMakeRequest()) {
      const waitTime = rateLimiter.getWaitTime();
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    // Add auth token
    const token = storage.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Request deduplication
    if (config.method?.toLowerCase() === 'get') {
      const requestKey = `${config.method}:${config.url}:${JSON.stringify(config.params)}`;
      
      if (pendingRequests.has(requestKey)) {
        // Return the existing pending request
        return Promise.reject({ 
          __CANCEL__: true, 
          pendingRequest: pendingRequests.get(requestKey) 
        });
      }
      
      const cancelToken = axios.CancelToken.source();
      config.cancelToken = cancelToken.token;
      
      const requestPromise = new Promise((resolve, reject) => {
        config.__resolve = resolve;
        config.__reject = reject;
      });
      
      pendingRequests.set(requestKey, { promise: requestPromise, cancel: cancelToken });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor with Retry Logic
 */
apiClient.interceptors.response.use(
  (response) => {
    // Clean up pending requests
    if (response.config.method?.toLowerCase() === 'get') {
      const requestKey = `${response.config.method}:${response.config.url}:${JSON.stringify(response.config.params)}`;
      pendingRequests.delete(requestKey);
    }

    // Update CSRF token if provided
    const newCsrfToken = response.headers['x-csrf-token'];
    if (newCsrfToken) {
      csrfToken = newCsrfToken;
    }

    return response;
  },
  async (error) => {
    // Handle deduplicated requests
    if (error.__CANCEL__ && error.pendingRequest) {
      return error.pendingRequest.promise;
    }

    const originalRequest = error.config;

    // Don't retry if request was cancelled
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Clean up pending requests on error
    if (originalRequest?.method?.toLowerCase() === 'get') {
      const requestKey = `${originalRequest.method}:${originalRequest.url}:${JSON.stringify(originalRequest.params)}`;
      pendingRequests.delete(requestKey);
    }

    // Handle 401 Unauthorized - Token Refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = storage.get('refreshToken');
        
        if (!refreshToken) {
          // No refresh token, redirect to login
          storage.remove('token');
          storage.remove('refreshToken');
          storage.remove('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Attempt to refresh token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });

        const { token, refreshToken: newRefreshToken } = response.data;
        
        storage.set('token', token);
        if (newRefreshToken) {
          storage.set('refreshToken', newRefreshToken);
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        storage.remove('token');
        storage.remove('refreshToken');
        storage.remove('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 
                        error.response.data?.retryAfter || 
                        60;
      
      console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
      
      // Don't retry automatically, let user know
      return Promise.reject({
        ...error,
        isRateLimited: true,
        retryAfter
      });
    }

    // Exponential Backoff for Network Errors
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      const maxRetries = 3;
      const retryCount = originalRequest._retryCount || 0;

      if (retryCount < maxRetries) {
        originalRequest._retryCount = retryCount + 1;
        
        // Calculate delay with exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, retryCount) * 1000;
        
        console.log(`Retrying request (${retryCount + 1}/${maxRetries}) after ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API Methods with Validation
 */

// Auth API
export const authAPI = {
  register: (data) => {
    // Sanitize inputs
    const sanitized = {
      name: sanitizeInput(data.name),
      email: sanitizeInput(data.email),
      password: data.password, // Don't sanitize password
      phone: data.phone ? sanitizeInput(data.phone) : undefined
    };
    return apiClient.post('/auth/register', sanitized);
  },
  
  login: (email, password) => {
    return apiClient.post('/auth/login', {
      email: sanitizeInput(email),
      password
    });
  },
  
  logout: () => apiClient.post('/auth/logout'),
  
  refreshToken: (refreshToken) => {
    return apiClient.post('/auth/refresh', { refreshToken });
  },
  
  forgotPassword: (email) => {
    return apiClient.post('/auth/forgot-password', {
      email: sanitizeInput(email)
    });
  },
  
  resetPassword: (token, password) => {
    return apiClient.post('/auth/reset-password', { token, password });
  },
  
  verifyEmail: (token) => {
    return apiClient.post('/auth/verify-email', { token });
  }
};

// Incidents API
export const incidentsAPI = {
  getAll: (params) => apiClient.get('/incidents', { params }),
  
  getById: (id) => apiClient.get(`/incidents/${id}`),
  
  getNearby: (lat, lng, radius) => {
    return apiClient.get('/incidents/nearby', {
      params: { lat, lng, radius }
    });
  },
  
  create: (data) => {
    // Sanitize description
    const sanitized = {
      ...data,
      description: data.description ? sanitizeInput(data.description) : undefined
    };
    return apiClient.post('/incidents', sanitized);
  },
  
  update: (id, data) => {
    const sanitized = {
      ...data,
      description: data.description ? sanitizeInput(data.description) : undefined
    };
    return apiClient.put(`/incidents/${id}`, sanitized);
  },
  
  delete: (id) => apiClient.delete(`/incidents/${id}`),
  
  verify: (id) => apiClient.post(`/incidents/${id}/verify`),
  
  reject: (id, reason) => {
    return apiClient.post(`/incidents/${id}/reject`, {
      reason: sanitizeInput(reason)
    });
  }
};

// Users API
export const usersAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  
  updateProfile: (data) => {
    const sanitized = {
      ...data,
      name: data.name ? sanitizeInput(data.name) : undefined,
      bio: data.bio ? sanitizeInput(data.bio) : undefined
    };
    return apiClient.put('/users/profile', sanitized);
  },
  
  changePassword: (currentPassword, newPassword) => {
    return apiClient.post('/users/change-password', {
      currentPassword,
      newPassword
    });
  },
  
  deleteAccount: () => apiClient.delete('/users/account')
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => apiClient.get('/notifications', { params }),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put('/notifications/read-all'),
  delete: (id) => apiClient.delete(`/notifications/${id}`)
};

// File Upload with Progress
export async function uploadFile(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
}

// Health Check
export function healthCheck() {
  return apiClient.get('/health');
}

export default apiClient;
