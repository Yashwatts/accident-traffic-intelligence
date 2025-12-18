import axios from 'axios';
import { storage } from './utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

/**
 * Axios instance with interceptors
 */
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Request interceptor - Add auth token
 */
api.interceptors.request.use(
  (config) => {
    const token = storage.get('accessToken');
    console.log('Request interceptor - Token:', token ? 'Token exists' : 'No token');
    console.log('Request URL:', config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors and refresh token
 */
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('401 Error - Attempting token refresh');
      originalRequest._retry = true;

      try {
        const refreshToken = storage.get('refreshToken');
        console.log('Refresh token:', refreshToken ? 'exists' : 'not found');
        
        if (refreshToken) {
          console.log('Calling refresh endpoint...');
          const response = await axios.post(
            `${API_BASE_URL}/api/${API_VERSION}/auth/refresh`,
            { refreshToken },
            { withCredentials: true }
          );

          console.log('Refresh response:', response.data);
          const { accessToken } = response.data.data;
          storage.set('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          console.log('Retrying original request with new token');
          return api(originalRequest);
        } else {
          // No refresh token - Clear storage and redirect to login
          console.log('No refresh token - redirecting to login');
          storage.remove('accessToken');
          storage.remove('refreshToken');
          storage.remove('user');
          window.location.href = '/login';
          return Promise.reject(new Error('No refresh token available'));
        }
      } catch (refreshError) {
        // Refresh failed - Clear tokens and redirect to login
        console.error('Refresh failed:', refreshError);
        storage.remove('accessToken');
        storage.remove('refreshToken');
        storage.remove('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorResponse = error.response?.data;
    
    // Extract error message properly
    let errorMessage = 'An unexpected error occurred';
    let errorDetails = null;
    
    if (errorResponse?.error) {
      // Backend returns: { success: false, error: { code, message, details } }
      errorMessage = errorResponse.error.message || errorMessage;
      errorDetails = errorResponse.error.details;
    } else if (errorResponse?.message) {
      errorMessage = errorResponse.message;
      errorDetails = errorResponse.details;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('API Error:', {
      status: error.response?.status,
      message: errorMessage,
      details: errorDetails,
      fullResponse: errorResponse
    });

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      code: errorResponse?.error?.code || errorResponse?.code,
      details: errorDetails,
    });
  }
);

/**
 * Auth API
 */
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

/**
 * Incidents API
 */
export const incidentsAPI = {
  getAll: (params) => api.get('/incidents', { params }),
  getById: (id) => api.get(`/incidents/${id}`),
  create: (data) => api.post('/incidents', data),
  update: (id, data) => api.patch(`/incidents/${id}`, data),
  delete: (id) => api.delete(`/incidents/${id}`),
  getNearby: (lat, lng, radius) => 
    api.get('/incidents/nearby', { params: { lat, lng, radius } }),
  uploadPhoto: (incidentId, formData) => 
    api.post(`/incidents/${incidentId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateStatus: (id, status, notes) => 
    api.patch(`/incidents/${id}/status`, { status, notes }),
  assignResponder: (id, responderId) => 
    api.post(`/incidents/${id}/assign`, { responderId }),
  verify: (id) => api.post(`/incidents/${id}/verify`),
  resolve: (id, notes) => api.post(`/incidents/${id}/resolve`, { notes }),
};

/**
 * Users API
 */
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  suspend: (id, reason) => api.post(`/users/${id}/suspend`, { reason }),
  activate: (id) => api.post(`/users/${id}/activate`),
};

/**
 * Notifications API
 */
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  updatePreferences: (preferences) => api.patch('/notifications/preferences', preferences),
};

/**
 * File upload helper
 */
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

export default api;
