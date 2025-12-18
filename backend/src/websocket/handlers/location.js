import { logger } from '../../utils/logger.js';
import { RoomManager } from '../utils/rooms.js';

/**
 * Setup location-based subscription handlers
 */
export const setupLocationHandlers = (io, socket) => {
  const roomManager = new RoomManager(io);

  /**
   * Subscribe to location-based updates
   */
  socket.on('location:subscribe', (data, callback) => {
    try {
      const { lat, lng, radius } = data;

      if (!lat || !lng) {
        return callback?.({ success: false, error: 'Latitude and longitude required' });
      }

      // Unsubscribe from previous locations
      roomManager.unsubscribeFromLocation(socket);

      // Subscribe to new location
      const radiusKm = radius || 10; // Default 10km
      const rooms = roomManager.subscribeToLocation(socket, lat, lng, radiusKm);

      // Store user's location on socket
      socket.userLocation = { lat, lng, radius: radiusKm };

      callback?.({
        success: true,
        message: `Subscribed to updates within ${radiusKm}km`,
        data: {
          location: { lat, lng },
          radius: radiusKm,
          roomCount: rooms.length,
        },
      });

      logger.info('Socket subscribed to location', {
        socketId: socket.id,
        userId: socket.userId,
        location: { lat, lng },
        radius: radiusKm,
      });
    } catch (error) {
      logger.error('Error subscribing to location', {
        error: error.message,
        socketId: socket.id,
      });
      callback?.({ success: false, error: error.message });
    }
  });

  /**
   * Update location subscription
   */
  socket.on('location:update', (data, callback) => {
    try {
      const { lat, lng, radius } = data;

      if (!lat || !lng) {
        return callback?.({ success: false, error: 'Latitude and longitude required' });
      }

      // Unsubscribe from old location
      roomManager.unsubscribeFromLocation(socket);

      // Subscribe to new location
      const radiusKm = radius || socket.userLocation?.radius || 10;
      const rooms = roomManager.subscribeToLocation(socket, lat, lng, radiusKm);

      socket.userLocation = { lat, lng, radius: radiusKm };

      callback?.({
        success: true,
        message: 'Location updated',
        data: {
          location: { lat, lng },
          radius: radiusKm,
        },
      });

      logger.debug('Socket location updated', {
        socketId: socket.id,
        userId: socket.userId,
        location: { lat, lng },
      });
    } catch (error) {
      logger.error('Error updating location', {
        error: error.message,
        socketId: socket.id,
      });
      callback?.({ success: false, error: error.message });
    }
  });

  /**
   * Unsubscribe from location updates
   */
  socket.on('location:unsubscribe', (data, callback) => {
    try {
      roomManager.unsubscribeFromLocation(socket);
      delete socket.userLocation;

      callback?.({ success: true, message: 'Unsubscribed from location updates' });

      logger.info('Socket unsubscribed from location', {
        socketId: socket.id,
        userId: socket.userId,
      });
    } catch (error) {
      logger.error('Error unsubscribing from location', {
        error: error.message,
        socketId: socket.id,
      });
      callback?.({ success: false, error: error.message });
    }
  });

  /**
   * Subscribe to city updates
   */
  socket.on('city:subscribe', (data, callback) => {
    try {
      const { city, state } = data;

      if (!city || !state) {
        return callback?.({ success: false, error: 'City and state required' });
      }

      roomManager.subscribeToCity(socket, city, state);

      callback?.({
        success: true,
        message: `Subscribed to ${city}, ${state} updates`,
      });

      logger.info('Socket subscribed to city', {
        socketId: socket.id,
        userId: socket.userId,
        city,
        state,
      });
    } catch (error) {
      logger.error('Error subscribing to city', {
        error: error.message,
        socketId: socket.id,
      });
      callback?.({ success: false, error: error.message });
    }
  });

  /**
   * Get nearby incidents count
   */
  socket.on('location:get-nearby-count', async (data, callback) => {
    try {
      const { lat, lng, radius } = data;

      if (!lat || !lng) {
        return callback?.({ success: false, error: 'Latitude and longitude required' });
      }

      // This would typically query the database
      // For now, return a placeholder
      callback?.({
        success: true,
        data: {
          nearbyIncidents: 0,
          radius: radius || 10,
        },
      });
    } catch (error) {
      logger.error('Error getting nearby count', {
        error: error.message,
        socketId: socket.id,
      });
      callback?.({ success: false, error: error.message });
    }
  });
};
