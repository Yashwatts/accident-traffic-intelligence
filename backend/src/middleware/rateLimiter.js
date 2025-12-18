/**
 * Rate Limiting Middleware
 * 
 * Implements multiple rate limiting strategies:
 * - IP-based rate limiting
 * - User-based rate limiting
 * - Endpoint-specific limits
 * - Sliding window algorithm
 */

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

// Redis client for distributed rate limiting
// Disabled for now - using memory store
let redisClient = null;

// Uncomment below to enable Redis-backed rate limiting:
/*
try {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500)
    }
  });
  
  redisClient.on('error', (err) => logger.error('Redis Client Error:', err));
  redisClient.on('connect', () => logger.info('Redis connected for rate limiting'));
  
  await redisClient.connect();
} catch (error) {
  logger.warn('Redis not available, using memory store for rate limiting:', error.message);
  redisClient = null;
}
*/

/**
 * General API Rate Limiter
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:general:',
  }) : undefined,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please slow down and try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime.getTime() - Date.now()) / 1000
    });
  }
});

/**
 * Strict Rate Limiter for Authentication Endpoints
 * Prevents brute force attacks
 * 5 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true, // Don't count successful auth attempts
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:',
  }) : undefined,
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}, Email: ${req.body?.email}`);
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Your account has been temporarily locked. Please try again in 15 minutes.',
      retryAfter: 900
    });
  }
});

/**
 * Incident Creation Rate Limiter
 * Prevents spam
 * 10 incidents per hour per user
 */
export const incidentCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    error: 'Too many incident reports',
    retryAfter: '1 hour'
  },
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    return req.user?.id || req.ip;
  },
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:incident:',
  }) : undefined,
  handler: (req, res) => {
    logger.warn(`Incident creation limit exceeded for user: ${req.user?.id || req.ip}`);
    res.status(429).json({
      error: 'Too many incident reports',
      message: 'You have reached your hourly limit for reporting incidents. Please try again later.',
      retryAfter: 3600
    });
  }
});

/**
 * Password Reset Rate Limiter
 * 3 attempts per hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    error: 'Too many password reset requests',
    retryAfter: '1 hour'
  },
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:pwreset:',
  }) : undefined
});

/**
 * File Upload Rate Limiter
 * 20 uploads per hour per user
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user?.id || req.ip,
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:upload:',
  }) : undefined,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many file uploads',
      message: 'Upload limit reached. Please try again later.',
      retryAfter: 3600
    });
  }
});

/**
 * WebSocket Connection Rate Limiter
 * 5 connections per minute per IP
 */
export const socketConnectionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:socket:',
  }) : undefined
});

/**
 * Dynamic Rate Limiter Factory
 * Create custom rate limiters on the fly
 */
export function createRateLimiter({ windowMs, max, message, keyGenerator }) {
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests',
    keyGenerator: keyGenerator || ((req) => req.ip),
    store: redisClient ? new RedisStore({
      client: redisClient,
      prefix: `rl:custom:${Date.now()}:`,
    }) : undefined
  });
}

/**
 * Graceful shutdown
 */
export async function closeRateLimiter() {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Rate limiter Redis connection closed');
  }
}

export default {
  generalLimiter,
  authLimiter,
  incidentCreationLimiter,
  passwordResetLimiter,
  uploadLimiter,
  socketConnectionLimiter,
  createRateLimiter,
  closeRateLimiter
};
