import { create } from 'zustand';

/**
 * UI state store
 */
export const useUIStore = create((set) => ({
  // Sidebar state
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  
  // Modal state
  modals: {},
  openModal: (modalName) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: true },
    })),
  closeModal: (modalName) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: false },
    })),

  // Toast notifications
  toasts: [],
  addToast: (messageOrToast, type) => {
    // Support both addToast('message', 'type') and addToast({ message, type })
    const toast = typeof messageOrToast === 'string' 
      ? { message: messageOrToast, type: type || 'info' }
      : messageOrToast;
    
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: Date.now(),
          type: 'info',
          duration: 5000,
          ...toast,
        },
      ],
    }));
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  // Loading states
  loadingStates: {},
  setLoading: (key, isLoading) =>
    set((state) => ({
      loadingStates: { ...state.loadingStates, [key]: isLoading },
    })),

  // User location
  userLocation: null,
  setUserLocation: (location) => set({ userLocation: location }),

  // Map center and zoom
  mapCenter: { lat: 37.7749, lng: -122.4194 },
  mapZoom: 12,
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),

  // Theme
  theme: 'light',
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),
}));
