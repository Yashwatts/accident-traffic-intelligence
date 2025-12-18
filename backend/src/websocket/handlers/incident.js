import { logger } from '../../utils/logger.js';
import { RoomManager } from '../utils/rooms.js';

/**
 * Setup incident event handlers
 */
export const setupIncidentHandlers = (io, socket) => {
  const roomManager = new RoomManager(io);

  /**
   * Subscribe to incident updates
   */
  socket.on('incident:subscribe', async (data, callback) => {
    try {
      const { incidentId } = data;

      if (!incidentId) {
        return callback?.({ success: false, error: 'Incident ID required' });
      }

      roomManager.subscribeToIncident(socket, incidentId);

      callback?.({ success: true, message: 'Subscribed to incident updates' });

      logger.info('Socket subscribed to incident', {
        socketId: socket.id,
        userId: socket.userId,
        incidentId,
      });
    } catch (error) {
      logger.error('Error subscribing to incident', {
        error: error.message,
        socketId: socket.id,
      });
      callback?.({ success: false, error: error.message });
    }
  });

  /**
   * Unsubscribe from incident
   */
  socket.on('incident:unsubscribe', (data, callback) => {
    try {
      const { incidentId } = data;
      const room = `incident:${incidentId}`;
      socket.leave(room);

      callback?.({ success: true, message: 'Unsubscribed from incident' });

      logger.info('Socket unsubscribed from incident', {
        socketId: socket.id,
        userId: socket.userId,
        incidentId,
      });
    } catch (error) {
      logger.error('Error unsubscribing from incident', {
        error: error.message,
        socketId: socket.id,
      });
      callback?.({ success: false, error: error.message });
    }
  });

  /**
   * Update incident status (responders only)
   */
  socket.on('incident:update-status', async (data, callback) => {
    try {
      if (socket.userRole !== 'responder' && socket.userRole !== 'admin') {
        return callback?.({ success: false, error: 'Insufficient permissions' });
      }

      const { incidentId, status, notes } = data;

      // Broadcast update to all subscribers
      roomManager.broadcastToIncident(incidentId, 'incident:status-updated', {
        incidentId,
        status,
        notes,
        updatedBy: {
          id: socket.userId,
          name: socket.user.fullName,
          role: socket.userRole,
        },
        timestamp: new Date().toISOString(),
      });

      callback?.({ success: true, message: 'Status update broadcasted' });

      logger.info('Incident status updated via socket', {
        socketId: socket.id,
        userId: socket.userId,
        incidentId,
        status,
      });
    } catch (error) {
      logger.error('Error updating incident status', {
        error: error.message,
        socketId: socket.id,
      });
      callback?.({ success: false, error: error.message });
    }
  });

  /**
   * Get incident updates count
   */
  socket.on('incident:get-subscribers', async (data, callback) => {
    try {
      const { incidentId } = data;
      const stats = await roomManager.getRoomStats(`incident:${incidentId}`);

      callback?.({
        success: true,
        data: {
          subscriberCount: stats.connectionCount,
        },
      });
    } catch (error) {
      logger.error('Error getting incident subscribers', {
        error: error.message,
        socketId: socket.id,
      });
      callback?.({ success: false, error: error.message });
    }
  });
};

/**
 * Broadcast incident created event
 */
export const broadcastIncidentCreated = (io, incident) => {
  const roomManager = new RoomManager(io);

  // Broadcast to location-based rooms
  roomManager.broadcastToLocation(
    incident.location.coordinates[1], // latitude
    incident.location.coordinates[0], // longitude
    'incident:created',
    {
      incident: {
        id: incident._id,
        type: incident.type,
        severity: incident.severity,
        location: {
          lat: incident.location.coordinates[1],
          lng: incident.location.coordinates[0],
        },
        address: incident.address.formattedAddress,
        status: incident.status,
        createdAt: incident.createdAt,
      },
    }
  );

  // Broadcast to responders
  roomManager.broadcastToResponders('incident:new', {
    incident: {
      id: incident._id,
      type: incident.type,
      severity: incident.severity,
      location: {
        lat: incident.location.coordinates[1],
        lng: incident.location.coordinates[0],
      },
      address: incident.address,
      requiresResponse: incident.severity === 'severe' || incident.severity === 'critical',
    },
  });

  logger.info('Incident created broadcast', {
    incidentId: incident._id,
    severity: incident.severity,
  });
};

/**
 * Broadcast incident updated event
 */
export const broadcastIncidentUpdated = (io, incident) => {
  const roomManager = new RoomManager(io);

  // Broadcast to incident subscribers
  roomManager.broadcastToIncident(incident._id.toString(), 'incident:updated', {
    incident: {
      id: incident._id,
      status: incident.status,
      severity: incident.severity,
      estimatedClearTime: incident.estimatedClearTime,
      assignedResponders: incident.assignedResponders,
      updatedAt: incident.updatedAt,
    },
  });

  // Also broadcast to location
  roomManager.broadcastToLocation(
    incident.location.coordinates[1],
    incident.location.coordinates[0],
    'incident:updated',
    {
      incidentId: incident._id,
      status: incident.status,
    },
    5 // smaller radius for updates
  );

  logger.info('Incident updated broadcast', {
    incidentId: incident._id,
    status: incident.status,
  });
};

/**
 * Broadcast incident cleared event
 */
export const broadcastIncidentCleared = (io, incident) => {
  const roomManager = new RoomManager(io);

  // Broadcast to location
  roomManager.broadcastToLocation(
    incident.location.coordinates[1],
    incident.location.coordinates[0],
    'incident:cleared',
    {
      incidentId: incident._id,
      clearedAt: incident.clearedAt,
      resolutionNotes: incident.resolutionNotes,
    }
  );

  // Broadcast to incident subscribers
  roomManager.broadcastToIncident(incident._id.toString(), 'incident:cleared', {
    incidentId: incident._id,
    clearedAt: incident.clearedAt,
  });

  logger.info('Incident cleared broadcast', {
    incidentId: incident._id,
  });
};
