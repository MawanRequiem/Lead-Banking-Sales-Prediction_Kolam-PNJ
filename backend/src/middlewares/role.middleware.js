const { ForbiddenError } = require('../utils/error.util');
const logger = require('../config/logger');

/**
 * Middleware untuk memeriksa role user
 * @param {Array<string>} allowedRoles - Array of allowed roles
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User information not found');
      }

      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        logger.warn(`Access denied for role: ${userRole}. Required: ${allowedRoles.join(', ')}`);
        throw new ForbiddenError('You do not have permission to access this resource');
      }

      next();
    } catch (error) {
      logger.warn('Authorization failed:', error.message);

      return res.status(error.statusCode || 403).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  };
}

module.exports = { requireRole };
