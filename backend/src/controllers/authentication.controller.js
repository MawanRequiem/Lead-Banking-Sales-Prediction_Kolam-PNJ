/**
 * Authentication Controller
 * OAuth 2.0 Structure with camelCase naming
 */

const { asyncHandler, BadRequestError, UnauthorizedError } = require('../middlewares/errorHandler.middleware');
const { successResponse } = require('../utils/response.util');
const logger = require('../config/logger');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/prisma');

// Import repositories
const salesRepository = require('../repositories/sales.repository');
const adminRepository = require('../repositories/admin.repository');
const tokenRepository = require('../repositories/token.repository');
const salesService = require('../services/sales.service');
const adminService = require('../services/admin.service');
const pwdVerificationService = require('../services/passwordVerification.service');
const { comparePassword, hashPassword } = require('../utils/password.util');

// In-memory failed password attempts counter (per-user). Note: resetting on process restart.
const failedPasswordAttempts = new Map();
const MAX_FAILED_ATTEMPTS = 3;

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

  // Set httpOnly cookies for tokens (cookie-based auth)
  const isProd = process.env.NODE_ENV === 'production';
  try {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    });

    // Refresh token longer lived (7 days)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    });
  } catch (e) {
    logger.warn('Failed to set auth cookies', e);
  }

  logger.audit('Login successful', {
    userId: user.userId,
    role: user.role,
    email: user.email,
    ip: res.locals.clientIp,
    requestId: res.locals.requestId,
  });

  // ✅ OAuth 2.0 structure with camelCase (API consistency)
  // We set httpOnly cookies above; still return minimal token metadata for clients
  return successResponse(res, {
    tokenType: 'Bearer',
    expiresIn,
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
  // Accept refresh token from body or cookie
  let refreshToken = req.body && req.body.refreshToken;
  if (!refreshToken && req.cookies) {
    refreshToken = req.cookies.refreshToken || req.cookies.refresh_token || req.cookies.refresh;
  }

  if (refreshToken) {
    try {
      await tokenRepository.revokeToken(refreshToken);
    } catch (e) {
      logger.warn('Failed to revoke refresh token during logout', e);
    }
  }

  // Clear cookies regardless (best-effort)
  try {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('accessToken', { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/' });
    res.clearCookie('refreshToken', { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/' });
  } catch (e) {
    logger.warn('Failed to clear auth cookies during logout', e);
  }

  logger.audit('User logged out', {
    userId: res.locals.userId,
    ip: res.locals.clientIp,
    requestId: res.locals.requestId,
  });

  return successResponse(res, { message: 'Logout successful' });
});

/**
 * Refresh Token
 * POST /api/refresh
 *
 * ✅ OAuth 2.0 inspired structure with camelCase
 */
const refresh = asyncHandler(async (req, res) => {
  // Accept refresh token from body or cookie
  let refreshToken = req.body && req.body.refreshToken;
  if (!refreshToken && req.cookies) {
    refreshToken = req.cookies.refreshToken || req.cookies.refresh_token || req.cookies.refresh;
  }

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

  // Set access token cookie (rotate refresh if needed)
  const isProd = process.env.NODE_ENV === 'production';
  try {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    });
    // Keep refresh token cookie as-is (or rotate if implementing rotate)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    });
  } catch (e) {
    logger.warn('Failed to set auth cookies on refresh', e);
  }

  logger.audit('Token refreshed', {
    userId: user.userId,
    role: user.role,
  });

  // Return minimal metadata; tokens are set in cookies
  return successResponse(res, {
    tokenType: 'Bearer',
    expiresIn,
  }, 'Token refreshed successfully');
});

/**
 * Verify current password (for change-password flow)
 * POST /api/verify-current
 */
const verifyCurrentPassword = asyncHandler(async (req, res) => {
  const userId = res.locals.userId;
  const role = res.locals.userRole;
  const { currentPassword } = req.body;

  if (!currentPassword) {
    throw new BadRequestError('Current password is required', 'CURRENT_PASSWORD_REQUIRED');
  }

  let record;
  if (role === 'admin') {
    record = await adminRepository.findByUserId(userId);
  } else {
    record = await salesRepository.findByUserId(userId);
  }

  if (!record || !record.user) {
    logger.security('Password verification failed - user not found', {
      userId,
      role,
      ip: res.locals.clientIp,
      requestId: res.locals.requestId,
    });
    throw new UnauthorizedError('User not found', 'USER_NOT_FOUND');
  }

  const match = await comparePassword(currentPassword, record.user.passwordHash);
  // If client supplied a verificationToken (rare here), do not validate password this way
  if (!match) {
    // increment failed attempts
    const prev = failedPasswordAttempts.get(userId) || 0;
    const next = prev + 1;
    failedPasswordAttempts.set(userId, next);

    logger.security('Password verification failed - incorrect password', {
      userId,
      role,
      ip: res.locals.clientIp,
      requestId: res.locals.requestId,
      attempts: next,
    });

    // If exceeded threshold, revoke refresh tokens for this user (force logout)
    if (next >= MAX_FAILED_ATTEMPTS) {
      try {
        await prisma.refreshToken.updateMany({
          where: { idUser: userId, revokedAt: null },
          data: { revokedAt: new Date(), modifiedAt: new Date() },
        });
        logger.audit('User refresh tokens revoked due to repeated failed password verification', {
          userId,
          attempts: next,
          requestId: res.locals.requestId,
          ip: res.locals.clientIp,
        });
      } catch (e) {
        logger.error('Failed to revoke refresh tokens after repeated failures', e);
      } finally {
        // reset counter after revocation
        failedPasswordAttempts.delete(userId);
      }

      // Return 400 so client sees a non-logout-causing error, but message explains forced logout
      throw new BadRequestError('Current password is incorrect. Too many failed attempts — your session has been revoked.', 'TOO_MANY_ATTEMPTS');
    }

    // For normal incorrect password attempts, return 400 (do not force immediate logout)
    throw new BadRequestError('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
  }

  // success -> reset counter
  failedPasswordAttempts.delete(userId);

  // Generate one-time verification token (short-lived)
  const verification = await pwdVerificationService.generateVerificationTokenForUser(userId, 5);

  logger.audit('Password verification successful (verification token issued)', {
    userId,
    role,
    ip: res.locals.clientIp,
    requestId: res.locals.requestId,
    tokenId: verification.id,
  });

  return successResponse(res, { verificationToken: verification.token }, 'Verification token issued');
});

/**
 * Change password for authenticated user
 * POST /api/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const userId = res.locals.userId;
  const role = res.locals.userRole;
  const { currentPassword, newPassword, verificationToken } = req.body;

  // newPassword is always required (validation middleware also enforces this)
  if (!newPassword) {
    throw new BadRequestError('New password is required', 'NEW_PASSWORD_REQUIRED');
  }

  // Require either currentPassword OR verificationToken (validation middleware uses xor)
  if (!currentPassword && !verificationToken) {
    throw new BadRequestError('Either currentPassword or verificationToken is required', 'PASSWORD_OR_TOKEN_REQUIRED');
  }

  let record;
  if (role === 'admin') {
    record = await adminRepository.findByUserId(userId);
  } else {
    record = await salesRepository.findByUserId(userId);
  }

  if (!record || !record.user) {
    logger.security('Password change failed - user not found', {
      userId,
      role,
      ip: res.locals.clientIp,
      requestId: res.locals.requestId,
    });
    throw new UnauthorizedError('User not found', 'USER_NOT_FOUND');
  }

  // If verificationToken provided, validate and consume it
  let tokenValidated = false;
  if (verificationToken) {
    const rec = await pwdVerificationService.validateAndConsumeToken(verificationToken, userId);
    if (!rec) {
      throw new BadRequestError('Invalid or expired verification token', 'INVALID_VERIFICATION_TOKEN');
    }
    tokenValidated = true;
  }

  if (!tokenValidated) {
    // fallback to currentPassword validation
    const match = await comparePassword(currentPassword, record.user.passwordHash);
    if (!match) {
      // increment failed attempts
      const prev = failedPasswordAttempts.get(userId) || 0;
      const next = prev + 1;
      failedPasswordAttempts.set(userId, next);

      logger.security('Password change failed - invalid current password', {
        userId,
        role,
        ip: res.locals.clientIp,
        requestId: res.locals.requestId,
        attempts: next,
      });

      if (next >= MAX_FAILED_ATTEMPTS) {
        try {
          await prisma.refreshToken.updateMany({
            where: { idUser: userId, revokedAt: null },
            data: { revokedAt: new Date(), modifiedAt: new Date() },
          });
          logger.audit('User refresh tokens revoked due to repeated failed password change attempts', {
            userId,
            attempts: next,
            requestId: res.locals.requestId,
            ip: res.locals.clientIp,
          });
        } catch (e) {
          logger.error('Failed to revoke refresh tokens after repeated failures', e);
        } finally {
          failedPasswordAttempts.delete(userId);
        }

        throw new BadRequestError('Current password is incorrect. Too many failed attempts — your session has been revoked.', 'TOO_MANY_ATTEMPTS');
      }

      throw new BadRequestError('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
    }

    // success -> reset counter
    failedPasswordAttempts.delete(userId);
  }

  const passwordHash = await hashPassword(newPassword);

  // Update via repository
  if (role === 'admin') {
    await adminRepository.updatePassword(record.idAdmin, passwordHash);
  } else {
    await salesRepository.updatePassword(record.idSales, passwordHash);
  }

  // Audit (do NOT log passwords)
  logger.audit('Password changed', {
    userId,
    role,
    ip: res.locals.clientIp,
    requestId: res.locals.requestId,
    userAgent: res.locals.userAgent,
  });

  // Revoke existing refresh tokens for the user (security) and issue a new one
  try {
    await tokenRepository.revokeTokensByUserId(userId);
  } catch (e) {
    logger.error('Failed to revoke prior refresh tokens after password change', e);
  }

  // Issue new tokens for the current session so user remains logged in
  const newRefreshToken = await createRefreshToken(userId);
  const userPayload = {
    id: record.idSales || record.idAdmin,
    userId: record.user.idUser,
    email: record.user.email,
    role: role,
  };
  const newAccessToken = generateAccessToken(userPayload);

  return successResponse(res, {
    message: 'Password changed successfully',
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

/**
 * Get authenticated user's profile
 * GET /api/me
 */
const getProfile = asyncHandler(async (req, res) => {
  const userId = res.locals.userId;
  const role = res.locals.userRole;

  // Admin: use adminService to fetch sanitized admin record
  if (role === 'admin') {
    const admin = await adminService.getAdminByUserId(userId);
    if (!admin) { throw new UnauthorizedError('User not found', 'USER_NOT_FOUND'); }

    const user = {
      id: admin.idAdmin,
      userId: admin.user?.idUser || admin.idUser,
      email: admin.user?.email || null,
      nama: admin.email ? admin.email.split('@')[0] : (admin.nama || null),
      role: 'admin',
    };

    return successResponse(res, { user }, 'Profile fetched');
  }

  // sales: use service to fetch + decrypt sensitive fields
  const sales = await salesService.getSalesByUserId(userId);

  const user = {
    id: sales.idSales,
    userId: sales.idUser || sales.userId,
    email: sales.user?.email || sales.email,
    nama: sales.nama,
    nomorTelepon: sales.nomorTelepon || null,
    domisili: sales.domisili || null,
    role: 'sales',
  };

  return successResponse(res, { user }, 'Profile fetched');
});

module.exports = {
  login,
  logout,
  refresh,
  getProfile,
  verifyCurrentPassword,
  changePassword,
};
