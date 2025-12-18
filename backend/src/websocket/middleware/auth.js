import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { User } from '../../services/user/user.model.js';
import { logger } from '../../utils/logger.js';

/**
 * Socket.io authentication middleware
 */
export const socketAuthMiddleware = async (socket, next) => {
  try {
    // Get token from auth header or handshake query
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return next(new Error('User not found'));
    }

    if (user.status !== 'active') {
      return next(new Error('Account is suspended'));
    }

    // Attach user to socket
    socket.user = user;
    socket.userId = user._id.toString();
    socket.userRole = user.role;

    logger.debug('Socket authenticated', {
      socketId: socket.id,
      userId: user._id,
      userRole: user.role,
    });

    next();
  } catch (error) {
    logger.warn('Socket authentication failed', {
      socketId: socket.id,
      error: error.message,
    });
    next(new Error('Authentication failed'));
  }
};

/**
 * Optional authentication - allows anonymous connections
 */
export const optionalSocketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-passwordHash');

      if (user && user.status === 'active') {
        socket.user = user;
        socket.userId = user._id.toString();
        socket.userRole = user.role;
      }
    }

    // Allow connection even without token
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (roles) => {
  return (socket, next) => {
    if (!socket.user) {
      return next(new Error('Authentication required'));
    }

    if (!roles.includes(socket.userRole)) {
      return next(new Error('Insufficient permissions'));
    }

    next();
  };
};
