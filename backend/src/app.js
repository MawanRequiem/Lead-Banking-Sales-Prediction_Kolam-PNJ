/**
 * Main Application Entry Point
 */

const express = require('express');
const { helmetConfig, corsConfig } = require('./config/security.config');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler.middleware');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
const { auditMiddleware } = require('./middlewares/audit.middleware');
const { validateEncryptionConfig } = require('./utils/encryption.util');
const logger = require('./config/logger');
const { prisma } = require('./config/prisma');
const { initCronJobs } = require('./jobs/scheduler');

const app = express();

// Validate encryption on startup
validateEncryptionConfig();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(corsConfig);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request tracking
app.use((req, res, next) => {
  const crypto = require('crypto');
  res.locals.requestId = crypto.randomUUID();
  res.locals.correlationId = req.headers['x-correlation-id'] || `corr_${crypto.randomBytes(8).toString('hex')}`;
  res.locals.clientIp = req.ip || req.connection.remoteAddress;
  res.locals.userAgent = req.get('user-agent');
  next();
});

// Request logging
app.use((req, res, next) => {
  logger.info('Incoming Request', {
    requestId: res.locals.requestId,
    method: req.method,
    path: req.path,
    ip: res.locals.clientIp,
  });
  next();
});

// Rate limiting
app.use(apiLimiter);

// Audit logging
app.use(auditMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api', require('./routes/authentication.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/sales', require('./routes/sales-operation.routes'));


// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

/**
 * Start Server
 */
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    initCronJobs();

    // Start listening
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API Base: http://localhost:${PORT}/api`);
      logger.info(`Admin API: http://localhost:${PORT}/api/admin`);
      console.log('\nServer is ready!\n');
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received, shutting down gracefully`);

      server.close(async () => {
        logger.info('HTTP server closed');

        await prisma.$disconnect();
        logger.info('Database connection closed');

        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
