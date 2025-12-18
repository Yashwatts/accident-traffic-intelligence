import { io } from 'socket.io-client';
import { storage } from './utils';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * Socket.io client manager
 */
class SocketManager {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
  }

  /**
   * Connect to socket server
   */
  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    // Disconnect any existing socket first
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const token = storage.get('accessToken');
    console.log('Connecting socket with token:', token ? 'Token exists' : 'No token');

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token || '',
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.setupDefaultListeners();

    return this.socket;
  }

  /**
   * Setup default event listeners
   */
  setupDefaultListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('connection:success', (data) => {
      console.log('Connection success:', data);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('server:shutdown', (data) => {
      console.warn('Server shutting down:', data.message);
    });
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  /**
   * Subscribe to event
   */
  on(event, callback) {
    if (!this.socket) {
      console.warn('Socket not connected. Call connect() first.');
      return;
    }

    this.socket.on(event, callback);

    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Unsubscribe from event
   */
  off(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);

    // Remove from stored listeners
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event with callback
   */
  emit(event, data, callback) {
    if (!this.socket) {
      console.warn('Socket not connected. Call connect() first.');
      return;
    }

    this.socket.emit(event, data, callback);
  }

  /**
   * Subscribe to location-based updates
   */
  subscribeToLocation(lat, lng, radius = 10) {
    return new Promise((resolve, reject) => {
      this.emit('location:subscribe', { lat, lng, radius }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Update location
   */
  updateLocation(lat, lng, radius) {
    return new Promise((resolve, reject) => {
      this.emit('location:update', { lat, lng, radius }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Unsubscribe from location
   */
  unsubscribeFromLocation() {
    return new Promise((resolve, reject) => {
      this.emit('location:unsubscribe', {}, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Subscribe to incident
   */
  subscribeToIncident(incidentId) {
    return new Promise((resolve, reject) => {
      this.emit('incident:subscribe', { incidentId }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Unsubscribe from incident
   */
  unsubscribeFromIncident(incidentId) {
    return new Promise((resolve, reject) => {
      this.emit('incident:unsubscribe', { incidentId }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Update incident status (responders only)
   */
  updateIncidentStatus(incidentId, status, notes) {
    return new Promise((resolve, reject) => {
      this.emit('incident:update-status', { incidentId, status, notes }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Subscribe to city
   */
  subscribeToCity(city, state) {
    return new Promise((resolve, reject) => {
      this.emit('city:subscribe', { city, state }, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Get connection status
   */
  getStatus() {
    return new Promise((resolve, reject) => {
      this.emit('status', {}, (response) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Ping server
   */
  ping() {
    return new Promise((resolve) => {
      const startTime = Date.now();
      this.emit('ping', {}, (response) => {
        const latency = Date.now() - startTime;
        resolve({ latency, timestamp: response.timestamp });
      });
    });
  }
}

// Export singleton instance
export const socketManager = new SocketManager();

// Export helper functions
export const connectSocket = () => socketManager.connect();
export const disconnectSocket = () => socketManager.disconnect();
export const subscribeToLocation = (lat, lng, radius) => 
  socketManager.subscribeToLocation(lat, lng, radius);
export const subscribeToIncident = (incidentId) => 
  socketManager.subscribeToIncident(incidentId);

export default socketManager;
