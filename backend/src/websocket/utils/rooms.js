import logger from '../../utils/logger.js';

/**
 * Room naming utilities
 */
export const RoomNames = {
  // Location-based rooms (grid-based)
  locationGrid: (lat, lng, precision = 2) => {
    // Round coordinates to create grid squares
    const latGrid = Math.floor(lat * Math.pow(10, precision));
    const lngGrid = Math.floor(lng * Math.pow(10, precision));
    return `location:${latGrid}:${lngGrid}`;
  },

  // City-based room
  city: (city, state) => `city:${state}:${city}`.toLowerCase(),

  // Incident-specific room
  incident: (incidentId) => `incident:${incidentId}`,

  // User-specific room (for private notifications)
  user: (userId) => `user:${userId}`,

  // Responder room (for all responders)
  responders: () => 'responders',

  // Admin room
  admins: () => 'admins',

  // Global broadcast
  global: () => 'global',
};

/**
 * Grid-based location manager
 */
export class LocationGridManager {
  constructor(precision = 2) {
    this.precision = precision;
    this.gridSize = 1 / Math.pow(10, precision); // Size of each grid square
  }

  /**
   * Get all grid rooms within a radius
   */
  getGridsInRadius(lat, lng, radiusKm) {
    // Approximate: 1 degree latitude ≈ 111km
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    const grids = new Set();

    // Calculate grid range
    const minLat = Math.floor((lat - latDelta) * Math.pow(10, this.precision));
    const maxLat = Math.ceil((lat + latDelta) * Math.pow(10, this.precision));
    const minLng = Math.floor((lng - lngDelta) * Math.pow(10, this.precision));
    const maxLng = Math.ceil((lng + lngDelta) * Math.pow(10, this.precision));

    // Generate all grid rooms in range
    for (let latGrid = minLat; latGrid <= maxLat; latGrid++) {
      for (let lngGrid = minLng; lngGrid <= maxLng; lngGrid++) {
        grids.add(`location:${latGrid}:${lngGrid}`);
      }
    }

    return Array.from(grids);
  }

  /**
   * Get neighboring grids (8 surrounding + current)
   */
  getNeighboringGrids(lat, lng) {
    const latGrid = Math.floor(lat * Math.pow(10, this.precision));
    const lngGrid = Math.floor(lng * Math.pow(10, this.precision));

    const grids = [];

    for (let latOffset = -1; latOffset <= 1; latOffset++) {
      for (let lngOffset = -1; lngOffset <= 1; lngOffset++) {
        grids.push(`location:${latGrid + latOffset}:${lngGrid + lngOffset}`);
      }
    }

    return grids;
  }
}

/**
 * Socket room manager
 */
export class RoomManager {
  constructor(io) {
    this.io = io;
    this.locationGrid = new LocationGridManager(2); // 2 decimal places
  }

  /**
   * Subscribe socket to location-based rooms
   */
  subscribeToLocation(socket, lat, lng, radiusKm = 10) {
    const rooms = this.locationGrid.getGridsInRadius(lat, lng, radiusKm);

    rooms.forEach((room) => {
      socket.join(room);
    });

    logger.debug('Socket subscribed to location rooms', {
      socketId: socket.id,
      userId: socket.userId,
      location: { lat, lng },
      radius: radiusKm,
      roomCount: rooms.length,
    });

    return rooms;
  }

  /**
   * Unsubscribe from location rooms
   */
  unsubscribeFromLocation(socket) {
    const rooms = Array.from(socket.rooms);
    rooms.forEach((room) => {
      if (room.startsWith('location:')) {
        socket.leave(room);
      }
    });

    logger.debug('Socket unsubscribed from location rooms', {
      socketId: socket.id,
      userId: socket.userId,
    });
  }

  /**
   * Subscribe to city updates
   */
  subscribeToCity(socket, city, state) {
    const room = RoomNames.city(city, state);
    socket.join(room);

    logger.debug('Socket subscribed to city', {
      socketId: socket.id,
      userId: socket.userId,
      city,
      state,
    });

    return room;
  }

  /**
   * Subscribe to specific incident
   */
  subscribeToIncident(socket, incidentId) {
    const room = RoomNames.incident(incidentId);
    socket.join(room);

    logger.debug('Socket subscribed to incident', {
      socketId: socket.id,
      userId: socket.userId,
      incidentId,
    });

    return room;
  }

  /**
   * Subscribe to user's private room
   */
  subscribeToUserRoom(socket) {
    if (socket.userId) {
      const room = RoomNames.user(socket.userId);
      socket.join(room);

      logger.debug('Socket subscribed to user room', {
        socketId: socket.id,
        userId: socket.userId,
      });

      return room;
    }
  }

  /**
   * Subscribe responders to responder room
   */
  subscribeToResponderRoom(socket) {
    if (socket.userRole === 'responder' || socket.userRole === 'admin') {
      const room = RoomNames.responders();
      socket.join(room);

      logger.debug('Socket subscribed to responder room', {
        socketId: socket.id,
        userId: socket.userId,
      });

      return room;
    }
  }

  /**
   * Get all sockets in a room
   */
  async getSocketsInRoom(roomName) {
    const sockets = await this.io.in(roomName).fetchSockets();
    return sockets;
  }

  /**
   * Get room statistics
   */
  async getRoomStats(roomName) {
    const sockets = await this.getSocketsInRoom(roomName);
    return {
      room: roomName,
      connectionCount: sockets.length,
      users: sockets.map((s) => ({
        socketId: s.id,
        userId: s.userId,
        role: s.userRole,
      })),
    };
  }

  /**
   * Broadcast to location
   */
  broadcastToLocation(lat, lng, event, data, radiusKm = 10) {
    const rooms = this.locationGrid.getGridsInRadius(lat, lng, radiusKm);

    rooms.forEach((room) => {
      this.io.to(room).emit(event, data);
    });

    logger.debug('Broadcast to location', {
      event,
      location: { lat, lng },
      radius: radiusKm,
      roomCount: rooms.length,
    });
  }

  /**
   * Broadcast to incident subscribers
   */
  broadcastToIncident(incidentId, event, data) {
    const room = RoomNames.incident(incidentId);
    this.io.to(room).emit(event, data);

    logger.debug('Broadcast to incident', {
      event,
      incidentId,
      room,
    });
  }

  /**
   * Send to specific user
   */
  sendToUser(userId, event, data) {
    const room = RoomNames.user(userId);
    this.io.to(room).emit(event, data);

    logger.debug('Sent to user', {
      event,
      userId,
    });
  }

  /**
   * Broadcast to all responders
   */
  broadcastToResponders(event, data) {
    const room = RoomNames.responders();
    this.io.to(room).emit(event, data);

    logger.debug('Broadcast to responders', {
      event,
    });
  }
}
