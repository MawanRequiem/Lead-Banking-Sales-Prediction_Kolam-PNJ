const { verifyToken } = require('../utils/token.util');
const { UnauthorizedError } = require('../utils/error.util');
const logger = require('../config/logger');

/**
 * Middleware untuk memverifikasi JWT token
 * Attach user data ke req.user jika valid
 */
function requireAuth(req, res, next) {
  try {
    // Extract token dari header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      throw new UnauthorizedError('Invalid or malformed token');
    }

    if (decoded.expired) {
      throw new UnauthorizedError('Token has expired');
    }

    // Attach user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logger.warn('Authentication failed:', error.message);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = { requireAuth };
