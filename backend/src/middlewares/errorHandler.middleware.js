/**
 * Unified Error Handler (UEH)
 * Standards: OWASP A04:2021, PCI-DSS 6.5.5, ISO 27001
 * Purpose: Centralized error handling with zero information leakage
 */

const { errorResponse } = require('../utils/response.util');
const logger = require('../config/logger');

/**
 * Custom Application Errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request', code = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict', code = 'CONFLICT') {
    super(message, 409, code);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', validationErrors = [], code = 'VALIDATION_ERROR') {
    super(message, 422, code);
    this.validationErrors = validationErrors;
  }
}

// class RateLimitError extends AppError {
//   constructor(message = 'Too many requests', retryAfter = 60) {
//     super(message, 429, 'RATE_LIMIT_EXCEEDED');
//     this.retryAfter = retryAfter;
//   }
// }

class InternalServerError extends AppError {
  constructor(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    super(message, 500, code);
  }
}

/**
 * Handle Prisma Database Errors (Secure)
 * NEVER expose database schema or queries
 */
function handlePrismaError(error) {
  const errorMap = {
    // Unique constraint violation
    P2002: {
      statusCode: 409,
      message: 'A record with this information already exists',
      code: 'DUPLICATE_ENTRY',
    },
    // Foreign key constraint violation
    P2003: {
      statusCode: 400,
      message: 'Invalid reference to related resource',
      code: 'INVALID_REFERENCE',
    },
    // Record not found
    P2025: {
      statusCode: 404,
      message: 'The requested resource was not found',
      code: 'NOT_FOUND',
    },
    // Required field missing
    P2011: {
      statusCode: 400,
      message: 'Required field is missing',
      code: 'REQUIRED_FIELD_MISSING',
    },
    // Invalid data type
    P2006: {
      statusCode: 400,
      message: 'Invalid data type provided',
      code: 'INVALID_DATA_TYPE',
    },
    // Database timeout
    P1008: {
      statusCode: 503,
      message: 'Service temporarily unavailable',
      code: 'SERVICE_TIMEOUT',
    },
    // Connection error
    P1001: {
      statusCode: 503,
      message: 'Service temporarily unavailable',
      code: 'SERVICE_UNAVAILABLE',
    },
  };

  const mapped = errorMap[error.code];

  if (mapped) {
    return new AppError(mapped.message, mapped.statusCode, mapped.code);
  }

  // Unknown Prisma error - log but don't expose
  logger.error('Unknown Prisma error', {
    code: error.code,
    message: error.message,
    meta: error.meta,
  });

  return new InternalServerError('A database error occurred');
}

/**
 * Handle JWT Authentication Errors
 */
function handleJWTError(error) {
  const errorMap = {
    JsonWebTokenError: new UnauthorizedError('Invalid authentication token', 'INVALID_TOKEN'),
    TokenExpiredError: new UnauthorizedError('Authentication token has expired', 'TOKEN_EXPIRED'),
    NotBeforeError: new UnauthorizedError('Token not yet valid', 'TOKEN_NOT_ACTIVE'),
  };

  return errorMap[error.name] || new UnauthorizedError('Authentication failed', 'AUTH_FAILED');
}

/**
 * Handle Validation Errors from express-validator
 */
function handleValidationError(error) {
  const errors = error.array ? error.array() : [error];
  const validationErrors = errors.map(err => ({
    field: err.param || err.field || 'unknown',
    message: err.msg || err.message || 'Invalid value',
    code: 'VALIDATION_ERROR',
  }));

  return new ValidationError('Request validation failed', validationErrors);
}

/**
 * Handle Multer File Upload Errors
 */
function handleMulterError(error) {
  const errorMap = {
    LIMIT_FILE_SIZE: new BadRequestError('File size exceeds limit', 'FILE_TOO_LARGE'),
    LIMIT_FILE_COUNT: new BadRequestError('Too many files uploaded', 'TOO_MANY_FILES'),
    LIMIT_UNEXPECTED_FILE: new BadRequestError('Unexpected file field', 'UNEXPECTED_FILE'),
  };

  return errorMap[error.code] || new BadRequestError('File upload error', 'UPLOAD_ERROR');
}

/**
 * Security Event Logger (SIEM Integration)
 */
function logSecurityEvent(error, req, res) {
  const securityEvents = {
    UNAUTHORIZED: 'authentication_failure',
    FORBIDDEN: 'authorization_failure',
    RATE_LIMIT_EXCEEDED: 'rate_limit_violation',
    INVALID_TOKEN: 'invalid_token_usage',
    TOKEN_EXPIRED: 'expired_token_usage',
  };

  const eventType = securityEvents[error.code];

  if (eventType) {
    logger.security(eventType, {
      requestId: res.locals.requestId,
      correlationId: res.locals.correlationId,
      errorCode: error.code,
      statusCode: error.statusCode,
      userId: res.locals.userId,
      clientIp: res.locals.clientIp,
      userAgent: res.locals.userAgent,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      severity: error.statusCode === 401 || error.statusCode === 403 ? 'HIGH' : 'MEDIUM',
    });
  }
}

/**
 * Main Error Handler Middleware
 */
function errorHandler(err, req, res, _next) {
  let error = err;

  // Convert known error types
  if (err.name === 'PrismaClientKnownRequestError') {
    error = handlePrismaError(err);
  } else if (err.name === 'PrismaClientValidationError') {
    error = new BadRequestError('Invalid request data', 'INVALID_REQUEST');
  } else if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(err.name)) {
    error = handleJWTError(err);
  } else if (err.name === 'ValidationError' || err.array) {
    error = handleValidationError(err);
  } else if (err.name === 'MulterError') {
    error = handleMulterError(err);
  } else if (err.name === 'SyntaxError' && err.status === 400 && 'body' in err) {
    error = new BadRequestError('Invalid JSON in request body', 'INVALID_JSON');
  } else if (err.name === 'CastError') {
    error = new BadRequestError('Invalid data format', 'INVALID_FORMAT');
  } else if (!err.isOperational) {
    // Unknown/unexpected error
    error = new InternalServerError();
  }

  // Log security events
  logSecurityEvent(error, req, res);

  // Log error for monitoring
  const logLevel = error.statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel]('Request Error', {
    requestId: res.locals.requestId,
    correlationId: res.locals.correlationId,
    statusCode: error.statusCode,
    code: error.code,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    userId: res.locals.userId,
    clientIp: res.locals.clientIp,
    path: req.path,
    method: req.method,
  });

  // Send error response
  return errorResponse(res, error, error.statusCode, {
    code: error.code,
    ...(error.validationErrors && { validationErrors: error.validationErrors }),
    ...(error.retryAfter && { retryAfter: error.retryAfter }),
  });
}

/**
 * 404 Not Found Handler
 */
function notFoundHandler(req, res) {
  logger.warn('Endpoint not found', {
    requestId: res.locals.requestId,
    path: req.path,
    method: req.method,
    clientIp: res.locals.clientIp,
  });

  return errorResponse(
    res,
    new NotFoundError('The requested endpoint does not exist'),
    404,
  );
}

/**
 * Async Handler Wrapper (eliminates try-catch)
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Operational Error Check (for process exit decision)
 */
function isOperationalError(error) {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

module.exports = {
  // Error classes
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  // RateLimitError,
  InternalServerError,

  // Handlers
  errorHandler,
  notFoundHandler,
  asyncHandler,
  isOperationalError,

  // Utilities
  handlePrismaError,
  handleJWTError,
  handleValidationError,
};
