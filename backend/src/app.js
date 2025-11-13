const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { config, validateEnv } = require('./config/env');
const logger = require('./config/logger');
const { connectDatabase, setupGracefulShutdown } = require('./config/prisma');

// Routes
const adminRoutes = require('./routes/admin.routes');

// Validate environment
validateEnv();

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Setup graceful shutdown
    setupGracefulShutdown();

    // Start listening
    const PORT = config.app.port;
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${config.app.env}`);
      logger.info(`🔗 Admin API: http://localhost:${PORT}/api/admin`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
