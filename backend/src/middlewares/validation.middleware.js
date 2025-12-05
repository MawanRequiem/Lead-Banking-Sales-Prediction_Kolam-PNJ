/**
 * COMPLETE VALIDATION MIDDLEWARE
 * Joi Schemas + Maximum Security Integration
 *
 * Security Layers:
 * 1. Pre-validation security scan
 * 2. Joi schema validation
 * 3. Custom business logic validation
 * 4. Deep sanitization
 * 5. Post-validation security check
 */

const { validationErrorResponse } = require('../utils/response.util');
const logger = require('../config/logger');

const {
  createSalesSchema,
  updateSalesSchema,
  resetPasswordSchema,
  salesQuerySchema,
  callsQuerySchema,
  logCallSchema,
  updateStatusSchema,
  dashboardQuerySchema,
  leadsOverviewQuerySchema,
} = require('../validation/schemas/sales.schema');

const {
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  changePasswordSchema,
  verifyCurrentSchema,
} = require('../validation/schemas/auth.schema');

const {
  containsSQLInjection,
  containsXSS,
  containsPathTraversal,
  containsCommandInjection,
} = require('../utils/security.util');

const { sanitizeInput } = require('../utils/sanitizers.util');

const { isValidUUID, validatePassword } = require('../utils/validators.util');

/**
 * ========================================
 * LAYER 1: SECURITY SCANNING
 * ========================================
 */

/**
 * Deep Security Scan - Detects all attack patterns
 */
function deepSecurityScan(data, context = 'body') {
  const dataStr = JSON.stringify(data);
  const threats = [];

  // SQL Injection
  if (containsSQLInjection(dataStr)) {
    threats.push({
      type: 'SQL_INJECTION',
      severity: 'CRITICAL',
      context,
    });
  }

  // XSS Attack
  if (containsXSS(dataStr)) {
    threats.push({
      type: 'XSS_ATTACK',
      severity: 'HIGH',
      context,
    });
  }

  // Path Traversal
  if (containsPathTraversal(dataStr)) {
    threats.push({
      type: 'PATH_TRAVERSAL',
      severity: 'HIGH',
      context,
    });
  }

  // Command Injection
  if (containsCommandInjection(dataStr)) {
    threats.push({
      type: 'COMMAND_INJECTION',
      severity: 'CRITICAL',
      context,
    });
  }

  return threats;
}

/**
 * Log Security Threats
 */
function logSecurityThreat(req, res, threats) {
  threats.forEach(threat => {
    logger.security(`${threat.type} detected`, {
      severity: threat.severity,
      context: threat.context,
      requestId: res.locals.requestId,
      clientIp: res.locals.clientIp,
      userAgent: res.locals.userAgent,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  });
}

/**
 * ========================================
 * LAYER 2: JOI VALIDATION
 * ========================================
 */

/**
 * Validate with Joi Schema
 */
function validateWithJoi(schema, data) {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/['"]/g, ''),
      code: detail.type.toUpperCase().replace(/\./g, '_'),
    }));

    return { hasError: true, errors };
  }

  return { hasError: false, value };
}

/**
 * ========================================
 * LAYER 3: BUSINESS LOGIC VALIDATION
 * ========================================
 */

/**
 * Custom Business Logic Validation
 */
function validateBusinessLogic(data, operation) {
  const errors = [];

  if (operation === 'createSales') {
    // Additional password checks
    if (data.password) {
      const passwordCheck = validatePassword(data.password);
      if (!passwordCheck.valid) {
        errors.push(...passwordCheck.errors);
      }

      // Password not similar to email
      if (data.email && data.password.toLowerCase().includes(data.email.split('@')[0].toLowerCase())) {
        errors.push({
          field: 'password',
          message: 'Password cannot contain parts of your email',
          code: 'PASSWORD_TOO_SIMILAR',
        });
      }

      // Password not similar to name
      if (data.nama) {
        const nameParts = data.nama.toLowerCase().split(' ');
        const passwordLower = data.password.toLowerCase();
        if (nameParts.some(part => part.length > 3 && passwordLower.includes(part))) {
          errors.push({
            field: 'password',
            message: 'Password cannot contain parts of your name',
            code: 'PASSWORD_TOO_SIMILAR',
          });
        }
      }
    }

    // Check for disposable email domains
    if (data.email) {
      const disposableDomains = [
        'tempmail.com', 'throwaway.email', '10minutemail.com',
        'guerrillamail.com', 'mailinator.com', 'yopmail.com',
      ];
      const domain = data.email.split('@')[1];
      if (disposableDomains.includes(domain)) {
        errors.push({
          field: 'email',
          message: 'Disposable email addresses are not allowed',
          code: 'DISPOSABLE_EMAIL',
        });
      }
    }
  }

  return errors;
}

/**
 * ========================================
 * LAYER 4: SANITIZATION
 * ========================================
 */

/**
 * Deep Sanitize Data
 */
function deepSanitize(data) {
  const sanitized = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === 'string') {
      // Don't sanitize password
      if (key === 'password' || key === 'newPassword' || key === 'currentPassword') {
        sanitized[key] = value;
      } else if (key === 'email') {
        sanitized[key] = sanitizeInput(value, {
          maxLength: 255,
          toLowerCase: true,
          normalizeEmail: true,
          stripHtml: true,
        });
      } else {
        sanitized[key] = sanitizeInput(value, {
          maxLength: 255,
          stripHtml: true,
        });
      }
    } else if (value instanceof Date) {
      sanitized[key] = value;
    } else if (typeof value === 'object') {
      sanitized[key] = deepSanitize(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * ========================================
 * VALIDATION MIDDLEWARE FUNCTIONS
 * ========================================
 */

/**
 * Validate Create Sales
 */
function validateCreateSales(req, res, next) {
  // Layer 1: Security scan
  const threats = deepSecurityScan(req.body, 'body');
  if (threats.length > 0) {
    logSecurityThreat(req, res, threats);
    const criticalThreats = threats.filter(t => t.severity === 'CRITICAL');
    if (criticalThreats.length > 0) {
      return validationErrorResponse(res, [{
        field: 'general',
        message: 'Security violation detected',
        code: 'SECURITY_THREAT_DETECTED',
      }]);
    }
  }

  // Layer 2: Joi validation
  const joiValidation = validateWithJoi(createSalesSchema, req.body);
  if (joiValidation.hasError) {
    return validationErrorResponse(res, joiValidation.errors);
  }

  // Layer 3: Business logic validation
  const businessErrors = validateBusinessLogic(joiValidation.value, 'createSales');
  if (businessErrors.length > 0) {
    return validationErrorResponse(res, businessErrors);
  }

  // Layer 4: Sanitization
  req.body = deepSanitize(joiValidation.value);

  next();
}

/**
 * Validate Update Sales
 */
function validateUpdateSales(req, res, next) {
  // Security scan
  const threats = deepSecurityScan(req.body, 'body');
  if (threats.some(t => t.severity === 'CRITICAL')) {
    logSecurityThreat(req, res, threats);
    return validationErrorResponse(res, [{
      field: 'general',
      message: 'Security violation detected',
      code: 'SECURITY_THREAT_DETECTED',
    }]);
  }

  // Joi validation
  const joiValidation = validateWithJoi(updateSalesSchema, req.body);
  if (joiValidation.hasError) {
    return validationErrorResponse(res, joiValidation.errors);
  }

  // Sanitization
  req.body = deepSanitize(joiValidation.value);

  next();
}

/**
 * Validate Reset Password
 */
function validateResetPassword(req, res, next) {
  const joiValidation = validateWithJoi(resetPasswordSchema, req.body);
  if (joiValidation.hasError) {
    return validationErrorResponse(res, joiValidation.errors);
  }

  // Additional password validation
  const passwordCheck = validatePassword(joiValidation.value.newPassword);
  if (!passwordCheck.valid) {
    return validationErrorResponse(res, passwordCheck.errors);
  }

  req.body = joiValidation.value;
  next();
}

/**
 * Validate UUID Parameter
 */
function validateUUIDParam(paramName = 'id') {
  return (req, res, next) => {
    const uuid = req.params[paramName];

    // Security check
    if (containsSQLInjection(uuid) || containsXSS(uuid)) {
      logger.security('Injection in URL parameter', {
        param: paramName,
        value: uuid,
        ip: res.locals.clientIp,
        requestId: res.locals.requestId,
      });
      return validationErrorResponse(res, [{
        field: paramName,
        message: 'Invalid parameter format',
        code: 'INVALID_PARAM',
      }]);
    }

    if (!isValidUUID(uuid)) {
      return validationErrorResponse(res, [{
        field: paramName,
        message: 'Invalid ID format. Must be a valid UUID',
        code: 'INVALID_UUID',
      }]);
    }

    next();
  };
}

/**
 * Validate Query Parameters (GET /sales)
 */
function validateGetAllQuery(req, res, next) {
  // Security scan
  const threats = deepSecurityScan(req.query, 'query');
  if (threats.length > 0) {
    logSecurityThreat(req, res, threats);
    if (threats.some(t => t.severity === 'CRITICAL')) {
      return validationErrorResponse(res, [{
        field: 'query',
        message: 'Invalid query parameters',
        code: 'INVALID_QUERY',
      }]);
    }
  }

  // Joi validation
  const joiValidation = validateWithJoi(salesQuerySchema, req.query);
  if (joiValidation.hasError) {
    return validationErrorResponse(res, joiValidation.errors);
  }

  // Sanitize search
  if (joiValidation.value.search) {
    joiValidation.value.search = sanitizeInput(joiValidation.value.search, {
      maxLength: 100,
      stripHtml: true,
    });
  }

  req.query = joiValidation.value;
  next();
}

function validateLeadsOverviewQuery(req, res, next) {
  const threats = deepSecurityScan(req.query, 'query');
  if (threats.length > 0) {
    logSecurityThreat(req, res, threats);
    if (threats.some(t => t.severity === 'CRITICAL')) {
      return validationErrorResponse(res, [{
        field: 'query',
        message: 'Invalid query parameters',
        code: 'INVALID_QUERY',
      }]);
    }
  }

  const joiValidation = validateWithJoi(leadsOverviewQuerySchema, req.query);
  if (joiValidation.hasError) {
    return validationErrorResponse(res, joiValidation.errors);
  }

  req.query = joiValidation.value;
  next();
}

/**
 * Validate Dashboard Query
 */
function validateDashboardQuery(req, res, next) {
  const threats = deepSecurityScan(req.query, 'query');
  if (threats.length > 0) {
    logSecurityThreat(req, res, threats);
    if (threats.some(t => t.severity === 'CRITICAL')) {
      return validationErrorResponse(res, [{ field: 'query', message: 'Invalid query parameters', code: 'INVALID_QUERY' }]);
    }
  }

  const joiValidation = validateWithJoi(dashboardQuerySchema, req.query);
  if (joiValidation.hasError) {
    return validationErrorResponse(res, joiValidation.errors);
  }

  // Sanitize search if present
  if (joiValidation.value.search) {
    joiValidation.value.search = sanitizeInput(joiValidation.value.search, { maxLength: 100, stripHtml: true });
  }

  req.query = joiValidation.value;
  next();
}

function validateCallHistoryQuery(req, res, next) {
  // Security scan
  const threats = deepSecurityScan(req.query, 'query');
  if (threats.length > 0) {
    logSecurityThreat(req, res, threats);
    if (threats.some(t => t.severity === 'CRITICAL')) {
      return validationErrorResponse(res, [{
        field: 'query',
        message: 'Invalid query parameters',
        code: 'INVALID_QUERY',
      }]);
    }
  }

  // Joi validation
  const joiValidation = validateWithJoi(callsQuerySchema, req.query);
  if (joiValidation.hasError) {
    return validationErrorResponse(res, joiValidation.errors);
  }

  // Sanitize search
  if (joiValidation.value.search) {
    joiValidation.value.search = sanitizeInput(joiValidation.value.search, {
      maxLength: 100,
      stripHtml: true,
    });
  }

  req.query = joiValidation.value;
  next();
}

/**
 * Validate Log Call (Sales Operation)
 */
function validateLogCall(req, res, next) {
  // Layer 1: Security Scan (Cek SQL Injection / XSS di body)
  const threats = deepSecurityScan(req.body, 'body');
  if (threats.length > 0) {
    logSecurityThreat(req, res, threats);
    // Jika ada ancaman kritis, tolak request
    if (threats.some(t => t.severity === 'CRITICAL')) {
      return validationErrorResponse(res, [{
        field: 'general',
        message: 'Security violation detected',
        code: 'SECURITY_THREAT_DETECTED',
      }]);
    }
  }

  // Layer 2: Joi Schema Validation
  const joiValidation = validateWithJoi(logCallSchema, req.body);
  console.log('[DEBUG] Joi Validation Result:', joiValidation.value);
  if (joiValidation.hasError) {
    return validationErrorResponse(res, joiValidation.errors);
  }

  // Layer 3: Sanitization (Bersihkan HTML/Script dari catatan)
  req.body = deepSanitize(joiValidation.value);
  console.log('[DEBUG] After sanitization:', req.body);

  next();
}

/**
 * Validate Update Status
 */
function validateUpdateStatus(req, res, next) {
  const joiValidation = validateWithJoi(updateStatusSchema, req.body);
  if (joiValidation.hasError) {
    return validationErrorResponse(res, joiValidation.errors);
  }
  req.body = joiValidation.value;
  next();
}

/**
 * ========================================
 * AUTHENTICATION VALIDATION
 * ========================================
 */

/**
 * Validate Login
 */
function validateLogin(req, res, next) {
  const joiValidation = validateWithJoi(loginSchema, req.body);
  if (joiValidation.hasError) {
    return validationErrorResponse(res, joiValidation.errors);
  }

  req.body = joiValidation.value;
  next();
}

/**
 * Validate Refresh Token
 */
function validateRefreshToken(req, res, next) {
  // Allow refreshToken to be provided in body or cookie for cookie-based flows
  const payload = Object.assign({}, req.body);
  if (!payload.refreshToken && req.cookies) {
    payload.refreshToken = req.cookies.refreshToken || req.cookies.refresh_token || req.cookies.refresh;
  }

  const joiValidation = validateWithJoi(refreshTokenSchema, payload);
  if (joiValidation.hasError) {
    return validationErrorResponse(res, joiValidation.errors);
  }

  req.body = joiValidation.value;
  next();
}

/**
 * Validate Logout
 */
function validateLogout(req, res, next) {
  // Accept refresh token from cookie if not present in body
  const payload = Object.assign({}, req.body);
  if (!payload.refreshToken && req.cookies) {
    payload.refreshToken = req.cookies.refreshToken || req.cookies.refresh_token || req.cookies.refresh;
  }

  const joiValidation = validateWithJoi(logoutSchema, payload);
  if (joiValidation.hasError) {
    return validationErrorResponse(res, joiValidation.errors);
  }

  req.body = joiValidation.value;
  next();
}

/**
 * Validate Change Password
 */
function validateChangePassword(req, res, next) {
  const joiValidation = validateWithJoi(changePasswordSchema, req.body);
  if (joiValidation.hasError) {
    return validationErrorResponse(res, joiValidation.errors);
  }

  req.body = joiValidation.value;
  next();
}

/**
 * Validate Verify Current Password
 */
function validateVerifyCurrent(req, res, next) {
  const joiValidation = validateWithJoi(verifyCurrentSchema, req.body);
  if (joiValidation.hasError) {
    return validationErrorResponse(res, joiValidation.errors);
  }

  req.body = joiValidation.value;
  next();
}

/**
 * ========================================
 * EXPORTS
 * ========================================
 */

module.exports = {
  // Sales validation
  validateCreateSales,
  validateUpdateSales,
  validateResetPassword,
  validateUUIDParam,
  validateGetAllQuery,
  validateCallHistoryQuery,
  validateLogCall,
  validateUpdateStatus,
  validateDashboardQuery,
  validateLeadsOverviewQuery,

  // Auth validation
  validateLogin,
  validateRefreshToken,
  validateLogout,
  validateChangePassword,
  validateVerifyCurrent,
};
