import express from 'express';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import { env, isProduction } from './config/env.js';
import connectDatabase from './config/database.js';
import logger, { morganStream } from './utils/logger.js';
import {
  helmetConfig,
  corsConfig,
  mongoSanitization,
  requestIdMiddleware,
  xssProtection,
  preventParameterPollution,
} from './middleware/security.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { initializeSocketServer, shutdownSocketServer } from './websocket/index.js';

/**
 * Initialize Express application
 */
const app = express();
const httpServer = createServer(app);

/**
 * Security Middleware
 */
app.use(helmetConfig); // Security headers
app.use(corsConfig); // CORS
app.use(mongoSanitization); // Prevent NoSQL injection
app.use(requestIdMiddleware); // Request ID for tracing
app.use(xssProtection); // XSS protection
app.use(preventParameterPollution); // Parameter pollution prevention

/**
 * Body Parsing Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

/**
 * Compression & Logging
 */
app.use(compression());
app.use(
  morgan(
    isProduction
      ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms'
      : 'dev',
    { stream: morganStream }
  )
);

/**
 * Rate Limiting
 */
if (isProduction) {
  app.use('/api', generalLimiter);
}

/**
 * Health Check
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
});

/**
 * API Routes
 */
app.get(`/api/${env.API_VERSION}`, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Traffic & Accident Intelligence Platform API',
    version: env.API_VERSION,
    documentation: '/api/docs',
  });
});

// Mount route handlers
import authRoutes from './services/auth/auth.routes.js';
import incidentRoutes from './services/incident/incident.routes.js';

app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
app.use(`/api/${env.API_VERSION}/incidents`, incidentRoutes);

/**
 * Error Handlers (must be last)
 */
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Initialize Socket.io
    const io = initializeSocketServer(httpServer);

    // Make io available to routes (attach to app)
    app.set('io', io);

    // Start listening
    httpServer.listen(env.PORT, () => {
      logger.info(`🚀 Server started successfully`, {
        port: env.PORT,
        environment: env.NODE_ENV,
        apiVersion: env.API_VERSION,
        url: `http://localhost:${env.PORT}`,
        websocket: 'enabled',
      });
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      // Shutdown Socket.io
      await shutdownSocketServer(io);

      // Close HTTP server
      httpServer.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
