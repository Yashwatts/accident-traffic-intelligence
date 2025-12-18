/**
 * Performance Optimization Utilities
 * 
 * - Response caching
 * - Query optimization
 * - Memory management
 * - Compression
 */

import compression from 'compression';
import { createClient } from 'redis';
import { logger } from './logger.js';

// Redis cache client
let cacheClient;
try {
  cacheClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500)
    }
  });
  
  cacheClient.on('error', (err) => logger.error('Cache Redis Error:', err));
  cacheClient.on('connect', () => logger.info('Cache Redis connected'));
  
  await cacheClient.connect();
} catch (error) {
  logger.warn('Redis cache not available:', error.message);
  cacheClient = null;
}

/**
 * Response Caching Middleware
 * Cache GET requests for specified duration
 */
export function cacheResponse(duration = 300) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    if (!cacheClient) {
      return next();
    }
    
    const key = `cache:${req.originalUrl || req.url}`;
    
    try {
      const cached = await cacheClient.get(key);
      
      if (cached) {
        logger.debug('Cache hit:', key);
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cached));
      }
      
      // Store original res.json
      const originalJson = res.json.bind(res);
      
      // Override res.json
      res.json = function(data) {
        // Cache the response
        cacheClient.setEx(key, duration, JSON.stringify(data))
          .catch(err => logger.error('Cache set error:', err));
        
        res.setHeader('X-Cache', 'MISS');
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
}

/**
 * Invalidate Cache by Pattern
 */
export async function invalidateCache(pattern) {
  if (!cacheClient) return;
  
  try {
    const keys = await cacheClient.keys(pattern);
    if (keys.length > 0) {
      await cacheClient.del(keys);
      logger.info(`Invalidated ${keys.length} cache keys matching: ${pattern}`);
    }
  } catch (error) {
    logger.error('Cache invalidation error:', error);
  }
}

/**
 * Response Compression Middleware
 * Compress responses to reduce bandwidth
 */
export const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024, // Only compress responses larger than 1KB
  level: 6 // Compression level (0-9, 6 is balanced)
});

/**
 * Query Result Memoization
 * Cache expensive database queries
 */
const queryCache = new Map();

export function memoizeQuery(key, ttl = 60000) {
  return async (queryFn) => {
    const cached = queryCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      logger.debug('Query cache hit:', key);
      return cached.data;
    }
    
    const data = await queryFn();
    queryCache.set(key, { data, timestamp: Date.now() });
    
    // Clean up old entries
    if (queryCache.size > 1000) {
      const now = Date.now();
      for (const [k, v] of queryCache.entries()) {
        if (now - v.timestamp > ttl) {
          queryCache.delete(k);
        }
      }
    }
    
    return data;
  };
}

/**
 * Pagination Helper
 * Optimize large result sets
 */
export function paginateResults(query, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return {
    query: query.skip(skip).limit(limit),
    page,
    limit,
    skip
  };
}

/**
 * Batch Processing
 * Process large arrays in chunks to avoid memory issues
 */
export async function batchProcess(items, batchSize, processFn) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processFn(batch);
    results.push(...batchResults);
    
    // Allow event loop to process other tasks
    await new Promise(resolve => setImmediate(resolve));
  }
  
  return results;
}

/**
 * Database Query Optimization Helpers
 */
export const queryOptimization = {
  // Select only needed fields
  selectFields: (fields) => fields.join(' '),
  
  // Lean queries (plain JS objects instead of Mongoose documents)
  lean: (query) => query.lean(),
  
  // Limit document size
  limitFields: (fields) => ({
    select: fields.join(' ')
  }),
  
  // Index hints
  useIndex: (indexName) => ({ hint: indexName })
};

/**
 * Memory Management
 * Monitor and optimize memory usage
 */
export function monitorMemory() {
  const used = process.memoryUsage();
  
  const metrics = {
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    external: `${Math.round(used.external / 1024 / 1024)} MB`,
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`
  };
  
  // Warn if heap usage is high
  const heapUsagePercent = (used.heapUsed / used.heapTotal) * 100;
  if (heapUsagePercent > 90) {
    logger.warn('High memory usage detected:', metrics);
  }
  
  return metrics;
}

/**
 * Lazy Loading Helper
 * Load related data only when needed
 */
export function createLazyLoader(model, relationField) {
  return async function(doc) {
    if (!doc[relationField]) {
      doc[relationField] = await model.findById(doc[`${relationField}Id`]);
    }
    return doc[relationField];
  };
}

/**
 * Connection Pooling Optimization
 */
export const poolConfig = {
  // MongoDB connection pool settings
  mongodb: {
    maxPoolSize: 50,
    minPoolSize: 10,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 5000
  },
  
  // Redis connection pool settings
  redis: {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    maxLoadingRetryTime: 5000
  }
};

/**
 * Request Deduplication
 * Prevent duplicate concurrent requests
 */
const pendingRequests = new Map();

export async function deduplicateRequest(key, requestFn) {
  if (pendingRequests.has(key)) {
    logger.debug('Deduplicating request:', key);
    return pendingRequests.get(key);
  }
  
  const promise = requestFn();
  pendingRequests.set(key, promise);
  
  try {
    const result = await promise;
    return result;
  } finally {
    pendingRequests.delete(key);
  }
}

/**
 * Graceful shutdown
 */
export async function closePerformanceUtils() {
  if (cacheClient) {
    await cacheClient.quit();
    logger.info('Performance cache closed');
  }
  queryCache.clear();
  pendingRequests.clear();
}

export default {
  cacheResponse,
  invalidateCache,
  compressionMiddleware,
  memoizeQuery,
  paginateResults,
  batchProcess,
  queryOptimization,
  monitorMemory,
  createLazyLoader,
  poolConfig,
  deduplicateRequest,
  closePerformanceUtils
};
