import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import crypto from 'crypto';

/**
 * Configure Helmet for security headers
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * Configure CORS
 */
export const corsConfig = cors({
  origin: (origin, callback) => {
    const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

/**
 * MongoDB query sanitization (prevent NoSQL injection)
 */
export const mongoSanitization = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`[Security] Sanitized request key: ${key} from ${req.ip}`);
  },
});

// Rate limiters have been moved to ./rateLimiter.js for better organization

/**
 * Add request ID for tracing
 */
export const requestIdMiddleware = (req, res, next) => {
  const requestId = crypto.randomBytes(16).toString('hex');
  res.locals.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

/**
 * XSS protection - sanitize user input
 */
export const xssProtection = (req, res, next) => {
  // Basic XSS sanitization for string inputs
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .replace(/[<>]/g, '') // Remove < and >
        .trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

/**
 * Prevent parameter pollution
 */
export const preventParameterPollution = (req, res, next) => {
  // Ensure query parameters are not arrays (except for allowed fields)
  const allowedArrayParams = ['severity', 'status', 'type', 'tags'];
  
  for (const key in req.query) {
    if (Array.isArray(req.query[key]) && !allowedArrayParams.includes(key)) {
      req.query[key] = req.query[key][0];
    }
  }
  
  next();
};
