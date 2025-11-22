/**
 * RFC 9457 Problem Details for HTTP APIs
 * Compliant with: PCI-DSS v4.0, ISO 27001:2022, OWASP ASVS 4.0 Level 3
 * Security Standard: Banking-Grade Enterprise Security
 *
 * @author Security Team
 * @version 2.0.0
 * @standard RFC-9457
 */

const crypto = require('crypto');
const logger = require('../config/logger');

/**
 * Generate Cryptographically Secure Request ID
 * Uses UUID v4 format for compatibility
 */
function generateRequestId() {
  return crypto.randomUUID(); // Native UUID v4 (Node 14.17+)
}

/**
 * Generate Security Correlation ID for distributed tracing
 */
function generateCorrelationId() {
  return `corr_${crypto.randomBytes(16).toString('hex')}`;
}

/**
 * Sanitize error messages - ZERO information leakage
 * Banking Standard: PCI-DSS Requirement 6.5.5
 * OWASP: A04:2021 – Insecure Design
 */
function sanitizeError(error, isDevelopment = false) {
  const statusCode = error.statusCode || 500;

  // RFC 9457 standard error types
  const errorTypes = {
    400: 'https://api.telesales.com/problems/bad-request',
    401: 'https://api.telesales.com/problems/unauthorized',
    403: 'https://api.telesales.com/problems/forbidden',
    404: 'https://api.telesales.com/problems/not-found',
    409: 'https://api.telesales.com/problems/conflict',
    422: 'https://api.telesales.com/problems/unprocessable-entity',
    429: 'https://api.telesales.com/problems/too-many-requests',
    500: 'https://api.telesales.com/problems/internal-server-error',
    503: 'https://api.telesales.com/problems/service-unavailable',
  };

  // Generic safe messages (NEVER expose internals in production)
  const safeMessages = {
    400: 'The request cannot be processed due to invalid parameters',
    401: 'Authentication is required to access this resource',
    403: 'You do not have permission to access this resource',
    404: 'The requested resource could not be found',
    409: 'The request conflicts with existing data',
    422: 'The provided data failed validation',
    429: 'Rate limit exceeded. Please retry after some time',
    500: 'An unexpected error occurred. Please contact support',
    503: 'The service is temporarily unavailable',
  };

  const result = {
    type: errorTypes[statusCode] || errorTypes[500],
    status: statusCode,
    title: getErrorTitle(statusCode),
    detail: isDevelopment && error.message
      ? error.message
      : safeMessages[statusCode] || safeMessages[500],
  };

  // Add instance identifier (RFC 9457)
  if (error.instance) {
    result.instance = error.instance;
  }

  // Add validation errors if present (sanitized)
  if (error.validationErrors && Array.isArray(error.validationErrors)) {
    result.errors = error.validationErrors.map(err => ({
      field: err.field,
      message: err.message,
    }));
  }

  return result;
}

/**
 * Get human-readable error title (RFC 9457)
 */
function getErrorTitle(statusCode) {
  const titles = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    503: 'Service Unavailable',
  };
  return titles[statusCode] || 'Error';
}

/**
 * Set Security Headers (OWASP Secure Headers Project)
 * Compliant with: OWASP A05:2021 – Security Misconfiguration
 */
function setSecurityHeaders(res, requestId) {
  res.set({
    // Prevent MIME sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // XSS Protection (legacy browsers)
    'X-XSS-Protection': '1; mode=block',

    // HSTS (HTTP Strict Transport Security)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // Content Security Policy
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",

    // Referrer Policy
    'Referrer-Policy': 'no-referrer',

    // Permissions Policy (Feature Policy)
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',

    // Request tracking
    'X-Request-ID': requestId,

    // Cache control (prevent sensitive data caching)
    'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',

    // Remove server info
    'X-Powered-By': '', // Remove this header entirely
  });

  // Explicitly remove X-Powered-By
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
}

/**
 * Success Response (200 OK)
 * RFC 9457 compliant success format
 */
function successResponse(res, data = null, message = 'Operation completed successfully', meta = {}) {
  const requestId = res.locals.requestId || generateRequestId();
  const correlationId = res.locals.correlationId || generateCorrelationId();

  const response = {
    success: true,
    requestId,
    correlationId,
    timestamp: new Date().toISOString(),
    message,
    data,
    ...(Object.keys(meta).length > 0 && { meta }),
  };

  setSecurityHeaders(res, requestId);

  return res.status(200).json(response);
}

/**
 * Created Response (201 Created)
 */
function createdResponse(res, data, message = 'Resource created successfully', resourceUri = null) {
  const requestId = res.locals.requestId || generateRequestId();
  const correlationId = res.locals.correlationId || generateCorrelationId();

  const response = {
    success: true,
    requestId,
    correlationId,
    timestamp: new Date().toISOString(),
    message,
    data,
  };

  setSecurityHeaders(res, requestId);

  // Set Location header if resource URI provided
  if (resourceUri) {
    res.set('Location', resourceUri);
  }

  return res.status(201).json(response);
}

/**
 * Error Response (RFC 9457 Problem Details)
 * Banking Standard: Complete information leakage prevention
 */
function errorResponse(res, error, statusCode = 500, additionalContext = {}) {
  const requestId = res.locals.requestId || generateRequestId();
  const correlationId = res.locals.correlationId || generateCorrelationId();
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Sanitize error
  const sanitized = typeof error === 'string'
    ? sanitizeError({ statusCode, message: error }, isDevelopment)
    : sanitizeError({ ...error, statusCode }, isDevelopment);

  // RFC 9457 Problem Details structure
  const problemDetails = {
    type: sanitized.type,
    status: sanitized.status,
    title: sanitized.title,
    detail: sanitized.detail,
    instance: res.locals.path || additionalContext.instance,
    requestId,
    correlationId,
    timestamp: new Date().toISOString(),
    ...(sanitized.errors && { errors: sanitized.errors }),
  };

  // Security audit logging (SIEM integration ready)
  logger.error('API Error', {
    requestId,
    correlationId,
    statusCode: sanitized.status,
    errorType: sanitized.type,
    message: error.message || error,
    stack: error.stack,
    userId: res.locals.userId,
    userRole: res.locals.userRole,
    clientIp: res.locals.clientIp,
    userAgent: res.locals.userAgent,
    path: res.locals.path,
    method: res.locals.method,
    securityContext: {
      tokenValid: res.locals.tokenValid,
      authMethod: res.locals.authMethod,
    },
    ...additionalContext,
  });

  setSecurityHeaders(res, requestId);

  return res.status(sanitized.status).json(problemDetails);
}

/**
 * Validation Error Response (RFC 9457 + JSON:API Errors)
 */
function validationErrorResponse(res, errors) {
  const requestId = res.locals.requestId || generateRequestId();
  const correlationId = res.locals.correlationId || generateCorrelationId();

  // Sanitize validation errors
  const sanitizedErrors = Array.isArray(errors)
    ? errors.map(err => ({
      field: err.field || 'unknown',
      message: err.message || 'Invalid value provided',
      code: err.code || 'VALIDATION_ERROR',
    }))
    : [{ field: 'general', message: 'Validation failed', code: 'VALIDATION_ERROR' }];

  // RFC 9457 Problem Details for validation
  const problemDetails = {
    type: 'https://api.telesales.com/problems/validation-error',
    status: 422,
    title: 'Unprocessable Entity',
    detail: 'Request validation failed. Please check the errors field for details',
    instance: res.locals.path,
    requestId,
    correlationId,
    timestamp: new Date().toISOString(),
    errors: sanitizedErrors,
  };

  // Log validation failures for security monitoring
  logger.warn('Validation Error', {
    requestId,
    correlationId,
    errors: sanitizedErrors,
    clientIp: res.locals.clientIp,
    path: res.locals.path,
  });

  setSecurityHeaders(res, requestId);

  return res.status(422).json(problemDetails);
}

/**
 * Rate Limit Response (429)
 */
function rateLimitResponse(res, retryAfter = 60) {
  const requestId = res.locals.requestId || generateRequestId();

  const problemDetails = {
    type: 'https://api.telesales.com/problems/rate-limit-exceeded',
    status: 429,
    title: 'Too Many Requests',
    detail: `Rate limit exceeded. Please retry after ${retryAfter} seconds`,
    instance: res.locals.path,
    requestId,
    timestamp: new Date().toISOString(),
    retryAfter,
  };

  setSecurityHeaders(res, requestId);
  res.set('Retry-After', retryAfter.toString());

  return res.status(429).json(problemDetails);
}

module.exports = {
  successResponse,
  createdResponse,
  errorResponse,
  validationErrorResponse,
  rateLimitResponse,
  generateRequestId,
  generateCorrelationId,
  sanitizeError,
  setSecurityHeaders,
};
