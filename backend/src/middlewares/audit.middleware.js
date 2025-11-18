/**
 * Audit Logging Middleware
 * Standards: ISO 27001, PCI-DSS 10.2, GDPR Article 30
 * Purpose: Complete audit trail for compliance and forensics
 */

const logger = require('../config/logger');
const { prisma } = require('../config/prisma');
const crypto = require('crypto');

/**
 * Sensitive fields to mask in logs (PII Protection)
 */
const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'newPassword',
  'oldPassword',
  'currentPassword',
  'confirmPassword',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
];

/**
 * Actions that require audit logging
 */
const AUDITABLE_ACTIONS = {
  // Authentication
  'POST:/api/login': 'USER_LOGIN',
  'POST:/api/logout': 'USER_LOGOUT',
  'POST:/api/refresh': 'TOKEN_REFRESH',

  // User Management
  'POST:/api/admin/sales': 'CREATE_USER',
  'PUT:/api/admin/sales/:id': 'UPDATE_USER',
  'DELETE:/api/admin/sales/:id': 'DELETE_USER',
  'POST:/api/admin/sales/:id/reset-password': 'RESET_PASSWORD',
  'POST:/api/admin/sales/:id/deactivate': 'DEACTIVATE_USER',
  'POST:/api/admin/sales/:id/activate': 'ACTIVATE_USER',

  // Data Access
  'GET:/api/admin/sales': 'VIEW_USERS_LIST',
  'GET:/api/admin/sales/:id': 'VIEW_USER_DETAILS',
};

/**
 * Mask sensitive data in objects
 */
function maskSensitiveData(obj, depth = 0) {
  if (depth > 5 || !obj || typeof obj !== 'object') {
    return obj;
  }

  const masked = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const lowerKey = key.toLowerCase();

      if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
        masked[key] = '***REDACTED***';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        masked[key] = maskSensitiveData(obj[key], depth + 1);
      } else {
        masked[key] = obj[key];
      }
    }
  }

  return masked;
}

/**
 * Generate audit event ID
 */
function generateAuditId() {
  return `audit_${crypto.randomBytes(16).toString('hex')}`;
}

/**
 * Get action type from route
 */
function getActionType(method, path) {
  // Normalize path (replace UUIDs with :id)
  const normalizedPath = path.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    ':id',
  );

  const key = `${method}:${normalizedPath}`;
  return AUDITABLE_ACTIONS[key] || 'UNKNOWN_ACTION';
}

/**
 * Check if action should be audited
 */
function shouldAudit(method, path) {
  // Always audit POST, PUT, DELETE, PATCH
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return true;
  }

  // Audit sensitive GET requests
  if (method === 'GET') {
    const sensitivePatterns = [
      /\/api\/admin\//,
      /\/api\/sales\/profile/,
      /\/api\/reports\//,
    ];

    return sensitivePatterns.some(pattern => pattern.test(path));
  }

  return false;
}

/**
 * Create audit log entry in database
 */
async function createAuditLog(auditData) {
  try {
    // Store in database for long-term compliance
    await prisma.$executeRaw`
      INSERT INTO audit_logs (
        id,
        timestamp,
        user_id,
        user_role,
        action_type,
        resource_type,
        resource_id,
        ip_address,
        user_agent,
        request_method,
        request_path,
        status_code,
        request_body,
        response_body,
        changes,
        metadata
      )
      VALUES (
        ${auditData.id},
        ${auditData.timestamp},
        ${auditData.userId},
        ${auditData.userRole},
        ${auditData.actionType},
        ${auditData.resourceType},
        ${auditData.resourceId},
        ${auditData.ipAddress},
        ${auditData.userAgent},
        ${auditData.requestMethod},
        ${auditData.requestPath},
        ${auditData.statusCode},
        ${auditData.requestBody}::jsonb,
        ${auditData.responseBody}::jsonb,
        ${auditData.changes}::jsonb,
        ${auditData.metadata}::jsonb
      )
    `;
  } catch (error) {
    // Don't fail request if audit logging fails, but log the error
    logger.error('Failed to create audit log', {
      error: error.message,
      auditId: auditData.id,
    });
  }
}

/**
 * Main Audit Middleware
 */
function auditMiddleware(req, res, next) {
  // Skip if not auditable
  if (!shouldAudit(req.method, req.path)) {
    return next();
  }

  const startTime = Date.now();
  const auditId = generateAuditId();

  // Store original response methods
  const originalJson = res.json;
  const originalSend = res.send;

  let responseBody = null;

  // Intercept response
  res.json = function (body) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  res.send = function (body) {
    if (!responseBody) {
      responseBody = body;
    }
    return originalSend.call(this, body);
  };

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const actionType = getActionType(req.method, req.path);

    const auditData = {
      id: auditId,
      timestamp: new Date(),
      userId: res.locals.userId || null,
      userRole: res.locals.userRole || null,
      actionType,
      resourceType: extractResourceType(req.path),
      resourceId: extractResourceId(req.path, req.params),
      ipAddress: res.locals.clientIp || req.ip,
      userAgent: res.locals.userAgent || req.get('user-agent'),
      requestMethod: req.method,
      requestPath: req.path,
      statusCode: res.statusCode,
      requestBody: JSON.stringify(maskSensitiveData(req.body)),
      responseBody: JSON.stringify(maskSensitiveData(
        typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody,
      )),
      changes: JSON.stringify(extractChanges(req, responseBody)),
      metadata: JSON.stringify({
        duration,
        requestId: res.locals.requestId,
        correlationId: res.locals.correlationId,
        query: req.query,
        success: res.statusCode < 400,
      }),
    };

    // Log to file/console (synchronous)
    logger.audit('Audit Event', auditData);

    createAuditLog(auditData).catch(err => {
      logger.error('Audit log storage failed', err);
    });
  });

  next();
}


/**
 * Extract resource type from path
 */
function extractResourceType(path) {
  if (path.includes('/sales')) {return 'SALES';}
  if (path.includes('/admin')) {return 'ADMIN';}
  if (path.includes('/login')) {return 'AUTH';}
  return 'UNKNOWN';
}

/**
 * Extract resource ID from path/params
 */
function extractResourceId(path, params) {
  return params.id || params.salesId || params.adminId || null;
}

/**
 * Extract what changed in the request
 */
function extractChanges(req, responseBody) {
  const changes = {};

  if (req.method === 'PUT' || req.method === 'PATCH') {
    // For updates, log what fields were changed
    changes.updatedFields = Object.keys(req.body);
  }

  if (req.method === 'POST' && responseBody?.data?.idSales) {
    changes.createdId = responseBody.data.idSales;
  }

  if (req.method === 'DELETE') {
    changes.deletedId = req.params.id;
  }

  return changes;
}

/**
 * Security Event Logger (for critical events)
 */
function logSecurityEvent(eventType, details) {
  const securityLog = {
    id: generateAuditId(),
    timestamp: new Date().toISOString(),
    eventType,
    severity: determineSeverity(eventType),
    ...details,
  };

  logger.security(eventType, securityLog);

  // Store critical security events in database
  if (securityLog.severity === 'HIGH' || securityLog.severity === 'CRITICAL') {
    createSecurityLog(securityLog).catch(err => {
      logger.error('Security log storage failed', err);
    });
  }
}

/**
 * Determine severity level
 */
function determineSeverity(eventType) {
  const highSeverity = [
    'AUTHENTICATION_FAILURE',
    'AUTHORIZATION_FAILURE',
    'SQL_INJECTION_ATTEMPT',
    'XSS_ATTEMPT',
    'RATE_LIMIT_EXCEEDED',
    'SUSPICIOUS_ACTIVITY',
  ];

  const criticalSeverity = [
    'DATA_BREACH_ATTEMPT',
    'PRIVILEGE_ESCALATION',
    'UNAUTHORIZED_ACCESS',
  ];

  if (criticalSeverity.includes(eventType)) {return 'CRITICAL';}
  if (highSeverity.includes(eventType)) {return 'HIGH';}
  return 'MEDIUM';
}

/**
 * Create security log entry
 */
async function createSecurityLog(securityData) {
  try {
    await prisma.$executeRaw`
      INSERT INTO security_logs (
        id,
        timestamp,
        event_type,
        severity,
        user_id,
        ip_address,
        user_agent,
        details
      )
      VALUES (
        ${securityData.id},
        ${securityData.timestamp},
        ${securityData.eventType},
        ${securityData.severity},
        ${securityData.userId || null},
        ${securityData.clientIp},
        ${securityData.userAgent},
        ${JSON.stringify(securityData)}::jsonb
      )
    `;
  } catch (error) {
    logger.error('Failed to create security log', error);
  }
}

module.exports = {
  auditMiddleware,
  logSecurityEvent,
  maskSensitiveData,
  generateAuditId,
};
