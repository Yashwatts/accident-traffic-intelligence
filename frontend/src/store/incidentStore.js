import { create } from 'zustand';
import { incidentsAPI } from '../lib/api';

/**
 * Incident store
 */
export const useIncidentStore = create((set, get) => ({
  incidents: [],
  selectedIncident: null,
  filters: {
    status: 'all',
    severity: 'all',
    type: 'all',
    radius: 10,
  },
  isLoading: false,
  error: null,

  /**
   * Fetch incidents
   */
  fetchIncidents: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await incidentsAPI.getAll({
        ...get().filters,
        ...params,
      });

      set({
        incidents: response.data?.incidents || response.data || [],
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
   * Fetch nearby incidents
   */
  fetchNearbyIncidents: async (lat, lng, radius) => {
    set({ isLoading: true, error: null });
    try {
      const response = await incidentsAPI.getNearby(lat, lng, radius);

      set({
        incidents: Array.isArray(response.data) ? response.data : (response.data?.incidents || []),
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
   * Fetch single incident
   */
  fetchIncident: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await incidentsAPI.getById(id);

      set({
        selectedIncident: response.data?.incident || response.data || null,
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
   * Create incident
   */
  createIncident: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await incidentsAPI.create(data);

      set((state) => ({
        incidents: [response.data.incident, ...state.incidents],
        isLoading: false,
      }));

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
   * Update incident
   */
  updateIncident: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await incidentsAPI.update(id, data);

      set((state) => ({
        incidents: state.incidents.map((incident) =>
          incident._id === id ? response.data.incident : incident
        ),
        selectedIncident:
          state.selectedIncident?._id === id
            ? response.data.incident
            : state.selectedIncident,
        isLoading: false,
      }));

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
   * Delete incident
   */
  deleteIncident: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await incidentsAPI.delete(id);

      set((state) => ({
        incidents: state.incidents.filter((incident) => incident._id !== id),
        selectedIncident:
          state.selectedIncident?._id === id ? null : state.selectedIncident,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Add incident (from socket)
   */
  addIncident: (incident) => {
    set((state) => {
      // Check if incident already exists
      const exists = state.incidents.some((i) => i._id === incident.id);
      if (exists) return state;

      return {
        incidents: [incident, ...state.incidents],
      };
    });
  },

  /**
   * Update incident from socket
   */
  updateIncidentFromSocket: (incidentId, updates) => {
    set((state) => ({
      incidents: state.incidents.map((incident) =>
        incident._id === incidentId
          ? { ...incident, ...updates }
          : incident
      ),
      selectedIncident:
        state.selectedIncident?._id === incidentId
          ? { ...state.selectedIncident, ...updates }
          : state.selectedIncident,
    }));
  },

  /**
   * Remove incident (cleared)
   */
  removeIncident: (incidentId) => {
    set((state) => ({
      incidents: state.incidents.filter((incident) => incident._id !== incidentId),
      selectedIncident:
        state.selectedIncident?._id === incidentId ? null : state.selectedIncident,
    }));
  },

  /**
   * Set filters
   */
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  /**
   * Set selected incident
   */
  setSelectedIncident: (incident) => {
    set({ selectedIncident: incident });
  },

  /**
   * Clear error
   */
  clearError: () => set({ error: null }),
}));
