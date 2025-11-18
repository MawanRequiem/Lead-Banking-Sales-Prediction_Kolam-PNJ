/**
 * Enhanced Authentication & Authorization Middleware
 * Standards: OWASP ASVS V2, V4, JWT Best Practices
 * Features: Token validation, refresh, blacklisting, session management
 */

const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('./errorHandler.middleware');
const logger = require('../config/logger');
const { prisma } = require('../config/prisma');

/**
 * Extract JWT from Authorization header
 */
function extractToken(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Support both "Bearer TOKEN" and "TOKEN"
  const parts = authHeader.split(' ');

  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return null;
}

/**
 * Verify JWT Token with enhanced security checks
 */
async function verifyToken(token) {
  try {
    // Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: process.env.JWT_ISSUER || 'telesales-api',
      audience: process.env.JWT_AUDIENCE || 'telesales-client',
    });

    // Additional security checks
    if (!decoded.id || !decoded.role) {
      throw new UnauthorizedError('Invalid token payload', 'INVALID_TOKEN_PAYLOAD');
    }

    // Check token age
    const tokenAge = Date.now() / 1000 - decoded.iat;
    const maxAge = 7 * 24 * 60 * 60; // 7 days

    if (tokenAge > maxAge) {
      throw new UnauthorizedError('Token too old', 'TOKEN_TOO_OLD');
    }

    // Check if token is blacklisted
    const isBlacklisted = await checkTokenBlacklist(token);
    if (isBlacklisted) {
      throw new UnauthorizedError('Token has been revoked', 'TOKEN_REVOKED');
    }

    // Verify user still exists and is active
    const user = await verifyUserStatus(decoded.id, decoded.role);
    if (!user) {
      throw new UnauthorizedError('User account not found or inactive', 'USER_INACTIVE');
    }

    return {
      ...decoded,
      userId: decoded.userId,
      user,
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token has expired', 'TOKEN_EXPIRED');
    }

    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid token', 'INVALID_TOKEN');
    }

    if (error.name === 'NotBeforeError') {
      throw new UnauthorizedError('Token not yet valid', 'TOKEN_NOT_ACTIVE');
    }

    throw error;
  }
}

function checkTokenBlacklist(_token) {
  // TODO: Implement Redis blacklist when available
  // Example implementation:
  // return redisClient.exists(`blacklist:${token}`)
  //   .then(result => result === 1);

  // For now, no tokens are blacklisted
  return Promise.resolve(false);
}


/**
 * Verify user exists and is active
 */
async function verifyUserStatus(userId, role) {
  try {
    if (role === 'admin') {
      const admin = await prisma.admin.findUnique({
        where: { idAdmin: userId },
        include: {
          user: {
            select: {
              idUser: true,
              email: true,
              isActive: true,
              deletedAt: true,
            },
          },
        },
      });

      if (!admin || !admin.user.isActive || admin.user.deletedAt) {
        return null;
      }

      return {
        id: admin.idAdmin,
        userId: admin.user.idUser,
        email: admin.user.email,
        role: 'admin',
      };
    }

    if (role === 'sales') {
      const sales = await prisma.sales.findUnique({
        where: { idSales: userId },
        include: {
          user: {
            select: {
              idUser: true,
              email: true,
              isActive: true,
              deletedAt: true,
            },
          },
        },
      });

      if (!sales || !sales.user.isActive || sales.user.deletedAt) {
        return null;
      }

      return {
        id: sales.idSales,
        userId: sales.user.idUser,
        email: sales.user.email,
        name: sales.nama,
        role: 'sales',
      };
    }

    return null;
  } catch (error) {
    logger.error('Error verifying user status', error);
    return null;
  }
}

/**
 * Main Authentication Middleware
 */
async function authenticateToken(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedError('Authentication token is required', 'TOKEN_REQUIRED');
    }

    const decoded = await verifyToken(token);

    // Attach user info to request and response locals
    req.user = decoded;
    res.locals.userId = decoded.userId;
    res.locals.userRole = decoded.role;
    res.locals.tokenValid = true;
    res.locals.authMethod = 'jwt';

    // Update last activity (optional - can be heavy on DB)
    // await updateLastActivity(decoded.userId);

    logger.debug('User authenticated', {
      requestId: res.locals.requestId,
      userId: decoded.userId,
      role: decoded.role,
    });

    next();
  } catch (error) {
    // Log authentication failure
    logger.security('Authentication failed', {
      requestId: res.locals.requestId,
      clientIp: res.locals.clientIp,
      error: error.message,
      path: req.path,
    });

    res.locals.tokenValid = false;
    next(error);
  }
}

/**
 * Authorization Middleware Factory
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required', 'AUTH_REQUIRED'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.security('Authorization failed', {
        requestId: res.locals.requestId,
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
      });

      return next(new ForbiddenError(
        'You do not have permission to access this resource',
        'INSUFFICIENT_PERMISSIONS',
      ));
    }

    next();
  };
}

/**
 * Require Admin Role
 */
const requireAdmin = requireRole('admin');

/**
 * Require Sales Role
 */
const requireSales = requireRole('sales');

/**
 * Require Admin or Sales Role
 */
const requireAuthenticated = requireRole('admin', 'sales');

/**
 * Optional Authentication (doesn't fail if no token)
 */
async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = await verifyToken(token);
      req.user = decoded;
      res.locals.userId = decoded.userId;
      res.locals.userRole = decoded.role;
    }
  } catch (error) {
    // Silently fail - auth is optional
    logger.debug('Optional auth failed', { error: error.message });
  }

  next();
}

/**
 * Resource Ownership Check
 * Ensures user can only access their own resources
 */
function requireOwnership(userIdParam = 'id') {
  return (req, res, next) => {
    const resourceUserId = req.params[userIdParam];
    const currentUserId = req.user.userId || req.user.id;

    // Admins can access all resources
    if (req.user.role === 'admin') {
      return next();
    }

    // Others can only access their own resources
    if (resourceUserId !== currentUserId) {
      logger.security('Ownership violation attempt', {
        requestId: res.locals.requestId,
        userId: currentUserId,
        attemptedResource: resourceUserId,
      });

      return next(new ForbiddenError(
        'You can only access your own resources',
        'OWNERSHIP_VIOLATION',
      ));
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireSales,
  requireAuthenticated,
  optionalAuth,
  requireOwnership,
  verifyToken,
  extractToken,
};
