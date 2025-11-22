const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { rateLimitResponse } = require('../utils/response.util');
const logger = require('../config/logger');

/**
 * Custom Rate Limit Handler
 */
function rateLimitHandler(req, res) {
  const retryAfter = parseInt(res.getHeader('Retry-After')) || 60;

  logger.security('Rate limit exceeded', {
    requestId: res.locals.requestId,
    clientIp: res.locals.clientIp,
    path: req.path,
    method: req.method,
    userAgent: res.locals.userAgent,
  });

  return rateLimitResponse(res, retryAfter);
}

/**
 * Skip Rate Limiting
 */
function skipRateLimiting(req, _res) {
  if (req.path === '/health' || req.path === '/api/health') {
    return true;
  }

  const whitelist = (process.env.RATE_LIMIT_WHITELIST || '').split(',').filter(Boolean);
  if (whitelist.includes(req.ip)) {
    return true;
  }

  return false;
}

/**
 * General API Rate Limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: skipRateLimiting,
});

/**
 * Strict Authentication Rate Limiter
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * Account Creation Rate Limiter
 */
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many accounts created, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * Password Reset Rate Limiter
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * Search/Query Rate Limiter
 */
const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
  message: 'Too many search requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: skipRateLimiting,
});

/**
 * Write Operation Limiter
 */
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many write operations, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: skipRateLimiting,
});

/**
 * Request Size Limiter
 */
function requestSizeLimiter(maxSize = '10mb') {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    const maxBytes = parseSize(maxSize);

    if (contentLength > maxBytes) {
      logger.security('Request size limit exceeded', {
        requestId: res.locals.requestId,
        clientIp: res.locals.clientIp,
        contentLength,
        maxSize,
      });

      return rateLimitResponse(res, 60);
    }

    next();
  };
}

function parseSize(size) {
  const units = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 };
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);

  if (!match) {return 10 * 1024 * 1024;}

  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';

  return value * units[unit];
}

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: () => 500,
  maxDelayMs: 20000,
  skipSuccessfulRequests: false,
  skip: skipRateLimiting,
  validate: {
    delayMs: false,
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  createAccountLimiter,
  passwordResetLimiter,
  searchLimiter,
  writeLimiter,
  speedLimiter,
  requestSizeLimiter,
};
