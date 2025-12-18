import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../lib/api';
import { storage } from '../lib/utils';
import { socketManager } from '../lib/socket';

/**
 * Authentication store
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Login user
       */
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          const { user, accessToken, refreshToken } = response.data;

          storage.set('accessToken', accessToken);
          storage.set('refreshToken', refreshToken);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          // Connect socket after login
          socketManager.connect();

          return response;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Register user
       */
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          const { user, accessToken, refreshToken } = response.data;

          storage.set('accessToken', accessToken);
          storage.set('refreshToken', refreshToken);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          // Connect socket after registration
          socketManager.connect();

          return response;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Logout user
       */
      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          storage.remove('accessToken');
          storage.remove('refreshToken');
          socketManager.disconnect();

          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      /**
       * Update user profile
       */
      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.updateProfile(data);
          // Backend returns { success, data: userObject, message }
          // So response.data contains the user object directly
          const user = response.data;

          set({
            user,
            isLoading: false,
          });

          return response;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Change password
       */
      changePassword: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.changePassword(data);
          set({ isLoading: false });
          return response;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      /**
       * Refresh user profile
       */
      refreshProfile: async () => {
        try {
          const response = await authAPI.getProfile();
          const { user } = response.data;

          set({ user });
          return response;
        } catch (error) {
          console.error('Failed to refresh profile:', error);
          throw error;
        }
      },

      /**
       * Clear error
       */
      clearError: () => set({ error: null }),

      /**
       * Initialize auth state from storage
       */
      initialize: () => {
        const token = storage.get('accessToken');
        const user = get().user;

        if (token && user) {
          set({ isAuthenticated: true });
          socketManager.connect();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
