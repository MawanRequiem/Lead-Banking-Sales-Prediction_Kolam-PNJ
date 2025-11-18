/**
 * Authentication Controller
 * OAuth 2.0 Structure with camelCase naming
 */

const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const { successResponse } = require('../utils/response.util');
const { UnauthorizedError } = require('../middlewares/errorHandler.middleware');
const logger = require('../config/logger');
const jwt = require('jsonwebtoken');

// Import repositories
const salesRepository = require('../repositories/sales.repository');
const adminRepository = require('../repositories/admin.repository');
const tokenRepository = require('../repositories/token.repository');
const { comparePassword } = require('../utils/password.util');

/**
 * Generate Access Token (JWT)
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      userId: user.userId,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      issuer: process.env.JWT_ISSUER || 'telesales-api',
      audience: process.env.JWT_AUDIENCE || 'telesales-client',
    },
  );
}

/**
 * Create Refresh Token
 */
async function createRefreshToken(userId) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const token = await tokenRepository.createToken({
    userId: userId,
    expiresAt: expiresAt,
  });
  return token.token;
}

/**
 * Get Token Expiration in Seconds
 */
function getTokenExpiresIn() {
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';

  // Convert to seconds
  if (expiresIn.endsWith('m')) {
    return parseInt(expiresIn) * 60;
  } else if (expiresIn.endsWith('h')) {
    return parseInt(expiresIn) * 3600;
  } else if (expiresIn.endsWith('d')) {
    return parseInt(expiresIn) * 86400;
  }

  return 900; // Default 15 minutes
}

/**
 * Authenticate Admin
 */
async function authenticateAdmin(email, password) {
  const admin = await adminRepository.findByEmail(email);
  if (!admin || !admin.user.isActive) {
    return null;
  }

  const isPasswordValid = await comparePassword(password, admin.user.passwordHash);
  if (!isPasswordValid) {
    return null;
  }

  return {
    id: admin.idAdmin,
    userId: admin.user.idUser,
    email: admin.user.email,
    role: 'admin',
    nama: admin.user.email.split('@')[0],
  };
}

/**
 * Authenticate Sales
 */
async function authenticateSales(email, password) {
  const sales = await salesRepository.findByEmail(email);
  if (!sales || !sales.user.isActive) {
    return null;
  }

  const isPasswordValid = await comparePassword(password, sales.user.passwordHash);
  if (!isPasswordValid) {
    return null;
  }

  return {
    id: sales.idSales,
    userId: sales.user.idUser,
    email: sales.user.email,
    nama: sales.nama,
    role: 'sales',
  };
}

/**
 * Login
 * POST /api/login
 *
 * ✅ OAuth 2.0 inspired structure with camelCase
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  logger.audit('Login attempt', {
    email,
    ip: res.locals.clientIp,
    requestId: res.locals.requestId,
  });

  // Try admin first, then sales
  let user = await authenticateAdmin(email, password);

  if (!user) {
    user = await authenticateSales(email, password);
  }

  if (!user) {
    logger.security('Failed login attempt', {
      email,
      ip: res.locals.clientIp,
    });
    throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = await createRefreshToken(user.userId);
  const expiresIn = getTokenExpiresIn();

  logger.audit('Login successful', {
    userId: user.userId,
    role: user.role,
    email: user.email,
    ip: res.locals.clientIp,
    requestId: res.locals.requestId,
  });

  // ✅ OAuth 2.0 structure with camelCase (API consistency)
  return successResponse(res, {
    accessToken,              // ✅ camelCase
    tokenType: 'Bearer',      // ✅ camelCase
    expiresIn,                // ✅ camelCase (seconds)
    refreshToken,             // ✅ camelCase
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      nama: user.nama,
    },
  }, 'Login successful');
});

/**
 * Logout
 * POST /api/logout
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new UnauthorizedError('Refresh token required', 'TOKEN_REQUIRED');
  }

  // Revoke refresh token
  await tokenRepository.revokeToken(refreshToken);

  logger.audit('User logged out', {
    userId: res.locals.userId,
    ip: res.locals.clientIp,
    requestId: res.locals.requestId,
  });

  return successResponse(res, {
    message: 'Logout successful',
  });
});

/**
 * Refresh Token
 * POST /api/refresh
 *
 * ✅ OAuth 2.0 inspired structure with camelCase
 */
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new UnauthorizedError('Refresh token required', 'TOKEN_REQUIRED');
  }

  // Verify refresh token
  const tokenRecord = await tokenRepository.findValidToken(refreshToken);

  if (!tokenRecord) {
    throw new UnauthorizedError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
  }

  // Get user
  let user;
  const admin = await adminRepository.findByUserId(tokenRecord.userId);
  if (admin) {
    user = {
      id: admin.idAdmin,
      userId: admin.user.idUser,
      email: admin.user.email,
      role: 'admin',
      nama: admin.user.email.split('@')[0],
    };
  } else {
    const sales = await salesRepository.findByUserId(tokenRecord.userId);
    if (!sales) {
      throw new UnauthorizedError('User not found', 'USER_NOT_FOUND');
    }
    user = {
      id: sales.idSales,
      userId: sales.user.idUser,
      email: sales.user.email,
      nama: sales.nama,
      role: 'sales',
    };
  }

  // Generate new access token
  const accessToken = generateAccessToken(user);
  const expiresIn = getTokenExpiresIn();

  logger.audit('Token refreshed', {
    userId: user.userId,
    role: user.role,
  });

  // ✅ OAuth 2.0 structure with camelCase
  return successResponse(res, {
    accessToken,
    tokenType: 'Bearer',
    expiresIn,
    refreshToken, // Return same refresh token
  }, 'Token refreshed successfully');
});

module.exports = {
  login,
  logout,
  refresh,
};
