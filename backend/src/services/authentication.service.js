const salesRepository = require('../repositories/sales.repository');
const adminRepository = require('../repositories/admin.repository');
const tokenRepository = require('../repositories/token.repository');
const logger = require('../config/logger');
const { comparePassword } = require('../utils/password.util');
const jwt = require('jsonwebtoken');

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


async function authenticateAdmin({ email, password }) {
  try {
    const admin = await adminRepository.findByEmail(email);
    if (!admin) {
      return null;
    }

    if (!admin.user.isActive) {
      throw new Error('Account is deactivated');
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
    };
  } catch (error) {
    logger.error('Error authenticating admin:', error);
    throw error;
  }
}

async function authenticateSales({ email, password }) {
  try {
    const sales = await salesRepository.findByEmail(email);
    if (!sales) {
      return null;
    }

    if (!sales.user.isActive) {
      throw new Error('Account is deactivated');
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
  } catch (error) {
    logger.error('Error authenticating sales:', error);
    throw error;
  }
}

async function createRefreshToken(userId) {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const token = await tokenRepository.createToken({
      userId: userId,
      expiresAt: expiresAt,
    });
    return token.token;
  } catch (error) {
    logger.error('Error creating refresh token:', error);
    throw error;
  }
}

module.exports = {
  authenticateAdmin,
  authenticateSales,
  createRefreshToken,
  generateAccessToken,
};
