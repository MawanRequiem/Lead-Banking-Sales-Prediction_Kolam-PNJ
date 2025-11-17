const salesRepository = require('../repositories/sales.repository');
const adminRepository = require('../repositories/admin.repository');
const tokenRepository = require('../repositories/token.repository');
const logger = require('../config/logger');
const { comparePassword } = require('../utils/password.util');

/**
 * Authenticate admin user
 * @param {object} data - { email, password }
 * @returns {Promise<object>}
 */
async function authenticateAdmin({ email, password }) {
  try {
    const admin = await adminRepository.findByEmail(email);
    if (!admin) {
      return null;
    }

    const isPasswordValid = await comparePassword(password, admin.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    const { idAdmin } = admin;
    const authResponse = { id: idAdmin, role: 'admin' };

    return authResponse;
  } catch (error) {
    logger.error('Error authenticating admin:', error);
    throw error;
  }
}

/**
 * Authenticate sales user
 * @param {object} data - { email, password }
 * @returns {Promise<object>}
 */
async function authenticateSales({ email, password }) {
  try {
    const sales = await salesRepository.findByEmail(email);
    if (!sales) {
      return null;
    }

    const isPasswordValid = await comparePassword(password, sales.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    const { idSales } = sales;
    const authResponse = { id: idSales, role: 'sales' };

    return authResponse;
  } catch (error) {
    logger.error('Error authenticating sales:', error);
    throw error;
  }
}

/**
 * Create refresh token
 * @param {object} data - { expiresAt }
 * @returns {Promise<object>}
 */
async function createRefreshToken() {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const token = await tokenRepository.createToken({ expiresAt });
    const tokenValue = token.token;
    return tokenValue;
  } catch (error) {
    logger.error('Error creating refresh token:', error);
    throw error;
  }
}

module.exports = {
  authenticateAdmin,
  authenticateSales,
  createRefreshToken,
};
