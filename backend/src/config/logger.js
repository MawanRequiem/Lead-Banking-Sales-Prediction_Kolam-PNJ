/**
 * Enhanced Winston Logger
 * Levels: audit, security, error, warn, info, http, debug
 */

const winston = require('winston');
const path = require('path');

const { format, transports } = winston;
const { combine, timestamp, printf, errors, colorize, json } = format;

// Custom format for console
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;

  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }

  return msg;
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log levels
const levels = {
  error: 0,
  security: 1,
  audit: 2,
  warn: 3,
  info: 4,
  http: 5,
  debug: 6,
};

const colors = {
  error: 'red',
  security: 'magenta',
  audit: 'yellow',
  warn: 'yellow',
  info: 'green',
  http: 'cyan',
  debug: 'blue',
};

winston.addColors(colors);

// Create logger instance
const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json(),
  ),
  transports: [
    // Error logs
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),

    // Security logs (separate file for compliance)
    new transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'security',
      maxsize: 10485760,
      maxFiles: 30, // Keep longer
    }),

    // Audit logs (separate file for compliance)
    new transports.File({
      filename: path.join(logsDir, 'audit.log'),
      level: 'audit',
      maxsize: 10485760,
      maxFiles: 30,
    }),

    // Combined logs
    new transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10485760,
      maxFiles: 14,
    }),
  ],
});

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: combine(colorize(), consoleFormat),
    }),
  );
}

// Add convenience methods
logger.security = (message, meta) => logger.log('security', message, meta);
logger.audit = (message, meta) => logger.log('audit', message, meta);

module.exports = logger;
