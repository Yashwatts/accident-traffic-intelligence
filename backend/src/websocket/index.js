import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { env, isProduction } from '../config/env.js';
import logger from '../utils/logger.js';
import { optionalSocketAuth } from './middleware/auth.js';
import { setupIncidentHandlers } from './handlers/incident.js';
import { setupLocationHandlers } from './handlers/location.js';
import { RoomManager } from './utils/rooms.js';

// Store io instance
let ioInstance = null;

/**
 * Get Socket.io instance
 */
export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized');
  }
  return ioInstance;
};

/**
 * Initialize Socket.io server
 */
export const initializeSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  });

  // Store instance
  ioInstance = io;

  // Setup Redis adapter for horizontal scaling (production)
  // Disabled for now - Redis not configured
  // if (isProduction && env.REDIS_HOST) {
  //   setupRedisAdapter(io);
  // }

  // Authentication middleware
  io.use(optionalSocketAuth);

  // Connection handler
  io.on('connection', (socket) => {
    handleConnection(io, socket);
  });

  logger.info('✅ Socket.io server initialized');

  return io;
};

/**
 * Setup Redis adapter for multi-server scaling
 */
const setupRedisAdapter = async (io) => {
  try {
    const pubClient = createClient({
      socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
      },
      password: env.REDIS_PASSWORD,
    });

    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));

    logger.info('✅ Redis adapter configured for Socket.io');

    pubClient.on('error', (err) => {
      logger.error('Redis pub client error:', err);
    });

    subClient.on('error', (err) => {
      logger.error('Redis sub client error:', err);
    });
  } catch (error) {
    logger.error('Failed to setup Redis adapter:', error);
    logger.warn('Socket.io will run in single-server mode');
  }
};

/**
 * Handle new socket connection
 */
const handleConnection = (io, socket) => {
  const roomManager = new RoomManager(io);

  logger.info('Socket connected', {
    socketId: socket.id,
    userId: socket.userId,
    userRole: socket.userRole,
    transport: socket.conn.transport.name,
  });

  // Subscribe to user's private room if authenticated
  if (socket.userId) {
    roomManager.subscribeToUserRoom(socket);
    // Join user-specific room for notifications
    socket.join(`user:${socket.userId}`);
  }

  // Subscribe responders to responder room
  if (socket.userRole === 'responder' || socket.userRole === 'admin') {
    roomManager.subscribeToResponderRoom(socket);
  }

  // Subscribe admins to admin room (they'll be filtered by state when fetching incidents)
  if (socket.userRole === 'admin') {
    socket.join('admin');
    logger.info('Admin joined admin room', { 
      socketId: socket.id, 
      userId: socket.userId
    });
  }

  // Setup event handlers
  setupLocationHandlers(io, socket);
  setupIncidentHandlers(io, socket);
  setupGeneralHandlers(io, socket);

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    handleDisconnect(socket, reason);
  });

  // Handle errors
  socket.on('error', (error) => {
    logger.error('Socket error', {
      socketId: socket.id,
      userId: socket.userId,
      error: error.message,
    });
  });

  // Send welcome message
  socket.emit('connection:success', {
    socketId: socket.id,
    authenticated: !!socket.userId,
    role: socket.userRole,
    message: 'Connected to real-time server',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Setup general handlers
 */
const setupGeneralHandlers = (io, socket) => {
  /**
   * Ping/Pong for connection health check
   */
  socket.on('ping', (callback) => {
    callback?.({
      success: true,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Get connection status
   */
  socket.on('status', (callback) => {
    callback?.({
      success: true,
      data: {
        socketId: socket.id,
        connected: socket.connected,
        authenticated: !!socket.userId,
        userId: socket.userId,
        role: socket.userRole,
        rooms: Array.from(socket.rooms),
        location: socket.userLocation,
      },
    });
  });

  /**
   * Get server stats (admin only)
   */
  socket.on('server:stats', async (callback) => {
    if (socket.userRole !== 'admin') {
      return callback?.({ success: false, error: 'Admin access required' });
    }

    try {
      const sockets = await io.fetchSockets();
      const stats = {
        totalConnections: sockets.length,
        authenticatedUsers: sockets.filter(s => s.userId).length,
        anonymousUsers: sockets.filter(s => !s.userId).length,
        responders: sockets.filter(s => s.userRole === 'responder').length,
        transports: {
          websocket: sockets.filter(s => s.conn.transport.name === 'websocket').length,
          polling: sockets.filter(s => s.conn.transport.name === 'polling').length,
        },
      };

      callback?.({ success: true, data: stats });
    } catch (error) {
      logger.error('Error getting server stats', { error: error.message });
      callback?.({ success: false, error: error.message });
    }
  });
};

/**
 * Handle socket disconnect
 */
const handleDisconnect = (socket, reason) => {
  logger.info('Socket disconnected', {
    socketId: socket.id,
    userId: socket.userId,
    reason,
    duration: Date.now() - socket.handshake.time,
  });

  // Cleanup is automatic - socket leaves all rooms on disconnect
  // Any additional cleanup can be done here
};

/**
 * Graceful shutdown
 */
export const shutdownSocketServer = async (io) => {
  logger.info('Shutting down Socket.io server...');

  // Notify all connected clients
  io.emit('server:shutdown', {
    message: 'Server is shutting down. Please reconnect in a moment.',
    timestamp: new Date().toISOString(),
  });

  // Wait a bit for messages to be sent
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Close all connections
  io.close();

  logger.info('Socket.io server shut down');
};

export default initializeSocketServer;
