/**
 * Authorization Middleware
 * 
 * Role-based access control (RBAC):
 * - user: Basic access
 * - responder: Emergency services
 * - admin: Full system access
 */

import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

/**
 * Require Authentication
 * Ensures user is logged in
 */
export function requireAuth(req, res, next) {
  if (!req.user) {
    logger.warn('Unauthorized access attempt:', { 
      ip: req.ip, 
      path: req.path 
    });
    
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }
  
  next();
}

/**
 * Require Specific Role
 * Factory function to create role-checking middleware
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Authorization failed:', { 
        userId: req.user.id, 
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path
      });
      
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to access this resource'
      });
    }
    
    next();
  };
}

/**
 * Check if user is admin
 */
export const requireAdmin = requireRole('admin');

/**
 * Check if user is responder or admin
 */
export const requireResponder = requireRole('responder', 'admin');

/**
 * Resource Ownership Check
 * Verify user owns the resource or is an admin
 */
export function requireOwnership(getResourceUserId) {
  return async (req, res, next) => {
    try {
      const resourceUserId = await getResourceUserId(req);
      
      if (!resourceUserId) {
        return res.status(404).json({
          error: 'Resource not found'
        });
      }
      
      const isOwner = resourceUserId.toString() === req.user.id.toString();
      const isAdmin = req.user.role === 'admin';
      
      if (!isOwner && !isAdmin) {
        logger.warn('Ownership check failed:', { 
          userId: req.user.id,
          resourceUserId,
          path: req.path
        });
        
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only modify your own resources'
        });
      }
      
      req.isOwner = isOwner;
      req.resourceUserId = resourceUserId;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Account Status Check
 * Ensure account is active and not banned
 */
export function requireActiveAccount(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }
  
  if (req.user.status === 'banned') {
    logger.warn('Banned user access attempt:', { 
      userId: req.user.id,
      path: req.path
    });
    
    return res.status(403).json({
      error: 'Account suspended',
      message: 'Your account has been suspended. Please contact support.'
    });
  }
  
  if (req.user.status === 'suspended') {
    return res.status(403).json({
      error: 'Account suspended',
      message: 'Your account is temporarily suspended. Please contact support.'
    });
  }
  
  if (req.user.emailVerified === false) {
    return res.status(403).json({
      error: 'Email not verified',
      message: 'Please verify your email address to continue'
    });
  }
  
  next();
}

/**
 * Permission-based authorization
 * Fine-grained permissions beyond roles
 */
export function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }
    
    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }
    
    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some(p => userPermissions.includes(p));
    
    if (!hasPermission) {
      logger.warn('Permission check failed:', { 
        userId: req.user.id,
        requiredPermissions: permissions,
        userPermissions,
        path: req.path
      });
      
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have the required permissions for this action'
      });
    }
    
    next();
  };
}

/**
 * Rate-based authorization
 * Prevent abuse by limiting actions per time period
 */
export function requireActionLimit({ action, maxAttempts, windowMs }) {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = `${req.user.id}:${action}`;
    const now = Date.now();
    
    const userAttempts = attempts.get(key) || [];
    const recentAttempts = userAttempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      const oldestAttempt = Math.min(...recentAttempts);
      const resetTime = oldestAttempt + windowMs;
      const waitTime = Math.ceil((resetTime - now) / 1000);
      
      return res.status(429).json({
        error: 'Action limit exceeded',
        message: `Please wait ${waitTime} seconds before trying again`,
        retryAfter: waitTime
      });
    }
    
    recentAttempts.push(now);
    attempts.set(key, recentAttempts);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      for (const [k, times] of attempts.entries()) {
        const valid = times.filter(time => now - time < windowMs);
        if (valid.length === 0) {
          attempts.delete(k);
        } else {
          attempts.set(k, valid);
        }
      }
    }
    
    next();
  };
}

/**
 * IP Whitelist Check
 * Restrict certain endpoints to specific IPs (admin panel, etc.)
 */
export function requireWhitelistedIP(whitelist = []) {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (whitelist.length > 0 && !whitelist.includes(clientIP)) {
      logger.warn('IP not whitelisted:', { 
        ip: clientIP,
        path: req.path
      });
      
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address is not authorized to access this resource'
      });
    }
    
    next();
  };
}

/**
 * Conditional Authorization
 * Apply different rules based on conditions
 */
export function conditionalAuth(condition, trueMiddleware, falseMiddleware = null) {
  return async (req, res, next) => {
    const shouldApplyTrue = typeof condition === 'function' 
      ? await condition(req) 
      : condition;
    
    if (shouldApplyTrue && trueMiddleware) {
      return trueMiddleware(req, res, next);
    } else if (!shouldApplyTrue && falseMiddleware) {
      return falseMiddleware(req, res, next);
    }
    
    next();
  };
}

export default {
  requireAuth,
  requireRole,
  requireAdmin,
  requireResponder,
  requireOwnership,
  requireActiveAccount,
  requirePermission,
  requireActionLimit,
  requireWhitelistedIP,
  conditionalAuth
};
