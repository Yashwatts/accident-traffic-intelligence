/**
 * Input Validation Middleware
 * 
 * Comprehensive validation for all API inputs:
 * - Schema validation
 * - Sanitization
 * - Type checking
 * - Business logic validation
 */

import { z } from 'zod';
import validator from 'validator';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

/**
 * Validation Schema Definitions
 */

// User Schemas
export const userSchemas = {
  register: z.object({
    firstName: z.string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must not exceed 50 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
    lastName: z.string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must not exceed 50 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
    email: z.string()
      .email('Invalid email address')
      .max(255, 'Email must not exceed 255 characters')
      .transform(val => val.toLowerCase().trim()),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    phoneNumber: z.string()
      .optional()
      .refine(val => !val || validator.isMobilePhone(val), 'Invalid phone number')
  }),

  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  }),

  updateProfile: z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().optional(),
    bio: z.string().max(500).optional(),
    notificationPreferences: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      sms: z.boolean().optional(),
      alertRadius: z.number().min(1).max(50).optional()
    }).optional()
  })
};

// Incident Schemas
export const incidentSchemas = {
  create: z.object({
    type: z.enum(['accident', 'traffic', 'hazard', 'construction', 'weather'], {
      errorMap: () => ({ message: 'Invalid incident type' })
    }),
    severity: z.enum(['critical', 'severe', 'high', 'moderate', 'low'], {
      errorMap: () => ({ message: 'Invalid severity level' })
    }),
    description: z.string()
      .max(1000, 'Description must not exceed 1000 characters')
      .optional()
      .transform(val => val ? validator.escape(val) : val), // XSS protection
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.tuple([
        z.number().min(-180).max(180), // longitude
        z.number().min(-90).max(90)    // latitude
      ])
    }),
    address: z.object({
      formattedAddress: z.string().max(500).optional(),
      street: z.string().max(200).optional(),
      city: z.string().max(100).optional(),
      state: z.string().max(100).optional(),
      country: z.string().max(100).optional(),
      postalCode: z.string().max(20).optional()
    }).optional()
  }),

  update: z.object({
    type: z.enum(['accident', 'traffic', 'hazard', 'construction', 'weather']).optional(),
    severity: z.enum(['critical', 'severe', 'high', 'moderate', 'low']).optional(),
    status: z.enum(['pending', 'active', 'resolved', 'rejected']).optional(),
    description: z.string().max(1000).optional().transform(val => val ? validator.escape(val) : val),
    verified: z.boolean().optional()
  }),

  query: z.object({
    lat: z.string().optional().refine(val => !val || !isNaN(parseFloat(val))),
    lng: z.string().optional().refine(val => !val || !isNaN(parseFloat(val))),
    radius: z.string().optional().refine(val => !val || (!isNaN(parseInt(val)) && parseInt(val) > 0)),
    severity: z.string().optional(),
    status: z.string().optional(),
    type: z.string().optional(),
    limit: z.string().optional().refine(val => !val || (!isNaN(parseInt(val)) && parseInt(val) > 0 && parseInt(val) <= 100)),
    page: z.string().optional().refine(val => !val || (!isNaN(parseInt(val)) && parseInt(val) > 0))
  })
};

// Location Schemas
export const locationSchemas = {
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    radius: z.number().min(0).max(50).optional().default(10)
  })
};

/**
 * Validation Middleware Factory
 */
export function validate(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      const data = source === 'query' ? req.query : 
                   source === 'params' ? req.params : 
                   req.body;

      const validated = await schema.parseAsync(data);
      
      if (source === 'body') {
        req.body = validated;
      } else if (source === 'query') {
        req.query = validated;
      } else if (source === 'params') {
        req.params = validated;
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const data = source === 'query' ? req.query : 
                     source === 'params' ? req.params : 
                     req.body;
        
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        logger.warn('Validation failed', { 
          errors, 
          receivedData: Object.keys(data),
          ip: req.ip,
          url: req.originalUrl
        });
        
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors
        });
      }
      
      next(error);
    }
  };
}

/**
 * Sanitize Request Body
 * Remove any potentially dangerous content
 */
export function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}

function sanitizeObject(obj) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip prototype pollution attempts
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    
    if (typeof value === 'string') {
      // Escape HTML and trim
      sanitized[key] = validator.escape(value.trim());
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? validator.escape(item.trim()) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Validate MongoDB ObjectId
 */
export function validateObjectId(paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({
        error: 'Invalid ID format',
        message: `The ${paramName} parameter must be a valid MongoDB ObjectId`
      });
    }
    
    next();
  };
}

/**
 * Validate Pagination Parameters
 */
export function validatePagination(req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  if (page < 1) {
    return res.status(400).json({
      error: 'Invalid pagination',
      message: 'Page number must be greater than 0'
    });
  }
  
  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      error: 'Invalid pagination',
      message: 'Limit must be between 1 and 100'
    });
  }
  
  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit
  };
  
  next();
}

/**
 * Validate File Upload
 */
export function validateFileUpload({ maxSize = 5 * 1024 * 1024, allowedTypes = [] }) {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a file'
      });
    }
    
    const files = req.files || [req.file];
    
    for (const file of files) {
      // Check file size
      if (file.size > maxSize) {
        return res.status(400).json({
          error: 'File too large',
          message: `File size must not exceed ${maxSize / (1024 * 1024)}MB`
        });
      }
      
      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: 'Invalid file type',
          message: `Only ${allowedTypes.join(', ')} files are allowed`
        });
      }
    }
    
    next();
  };
}

/**
 * Business Logic Validators
 */

// Validate location is within service area
export function validateServiceArea(req, res, next) {
  const { lat, lng } = req.body.location?.coordinates || 
                       { lat: req.query.lat, lng: req.query.lng };
  
  if (!lat || !lng) return next();
  
  // Example: Only allow US coordinates
  // Adjust based on your service area
  if (lat < 24.5 || lat > 49.4 || lng < -125 || lng > -66.9) {
    return res.status(400).json({
      error: 'Location outside service area',
      message: 'This service is currently only available in the United States'
    });
  }
  
  next();
}

// Prevent duplicate incidents (within 500m and 30 minutes)
export async function validateNoDuplicateIncident(req, res, next) {
  // Implementation would query database for nearby recent incidents
  // This is a placeholder - implement with actual DB query
  next();
}

export default {
  validate,
  sanitizeBody,
  validateObjectId,
  validatePagination,
  validateFileUpload,
  validateServiceArea,
  validateNoDuplicateIncident,
  userSchemas,
  incidentSchemas,
  locationSchemas
};
