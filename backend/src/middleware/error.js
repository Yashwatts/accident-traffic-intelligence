import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import logger from '../utils/logger.js';
import { env, isProduction } from '../config/env.js';
import { Error as MongooseError } from 'mongoose';

/**
 * Convert various error types to ApiError
 */
const convertToApiError = (err) => {
  // Already an ApiError
  if (err instanceof ApiError) {
    return err;
  }

  // Mongoose validation error
  if (err instanceof MongooseError.ValidationError) {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));
    return ApiError.validation('Validation failed', errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    return ApiError.conflict(
      `${field} already exists`,
      'DUPLICATE_KEY',
      { field }
    );
  }

  // Mongoose cast error (invalid ObjectId)
  if (err instanceof MongooseError.CastError) {
    return ApiError.badRequest(
      `Invalid ${err.path}: ${err.value}`,
      'INVALID_ID'
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiError.unauthorized('Invalid token', 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiError.unauthorized('Token expired', 'TOKEN_EXPIRED');
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ApiError.badRequest(
        'File size exceeds maximum limit',
        'FILE_TOO_LARGE'
      );
    }
    return ApiError.badRequest(err.message, 'FILE_UPLOAD_ERROR');
  }

  // Default to internal server error
  return ApiError.internal(
    isProduction ? 'Internal server error' : err.message
  );
};

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  const apiError = convertToApiError(err);

  // Log error
  if (!apiError.isOperational) {
    logger.error('Unexpected error:', {
      error: err,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: res.locals.user?.id,
    });
  } else {
    logger.warn('Operational error:', {
      message: apiError.message,
      code: apiError.code,
      statusCode: apiError.statusCode,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Send error response
  return ApiResponse.error(
    res,
    apiError.statusCode,
    apiError.message,
    apiError.code,
    isProduction ? undefined : apiError.details || err.stack
  );
};

/**
 * Handle 404 - Route not found
 */
export const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(
    `Route ${req.originalUrl} not found`,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
