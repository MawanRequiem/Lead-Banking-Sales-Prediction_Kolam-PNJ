const { prisma } = require('../config/prisma');
const logger = require('../config/logger');

/**
 * Create refresh token
 * @param {Object} data - { expiresAt: Date }
 * @returns {Promise<Object>}
 */
async function createToken(data) {
  try {
    // ✅ CORRECT: prisma.refreshToken (singular)
    const token = await prisma.refreshToken.create({
      data: {
        expiresAt: data.expiresAt,
      },
    });

    logger.info(`Token created: ${token.token}`);
    return token;
  } catch (error) {
    logger.error('Error creating token:', error);
    throw error;
  }
}

/**
 * Find token by token string
 * @param {string} tokenString - Token UUID
 * @returns {Promise<Object|null>}
 */
async function findByToken(tokenString) {
  try {
    const token = await prisma.refreshToken.findUnique({
      where: { token: tokenString },
    });
    return token;
  } catch (error) {
    logger.error('Error finding token:', error);
    throw error;
  }
}

/**
 * Revoke token
 * @param {string} tokenString - Token UUID to revoke
 * @param {string} replacedBy - Optional UUID of replacement token
 * @returns {Promise<Object>}
 */
async function revokeToken(tokenString, replacedBy = null) {
  try {
    const updateData = {
      revokedAt: new Date(),
      modifiedAt: new Date(),
    };

    if (replacedBy) {
      updateData.replacedBy = replacedBy;
    }

    const token = await prisma.refreshToken.update({
      where: { token: tokenString },
      data: updateData,
    });

    logger.info(`Token revoked: ${tokenString}`);
    return token;
  } catch (error) {
    logger.error('Error revoking token:', error);
    throw error;
  }
}

/**
 * Delete expired tokens (cleanup)
 * @returns {Promise<number>} Count of deleted tokens
 */
async function deleteExpiredTokens() {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    logger.info(`Deleted ${result.count} expired tokens`);
    return result.count;
  } catch (error) {
    logger.error('Error deleting expired tokens:', error);
    throw error;
  }
}

/**
 * Delete old revoked tokens
 * @param {number} days - Days to keep revoked tokens
 * @returns {Promise<number>}
 */
async function deleteRevokedTokens(days = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await prisma.refreshToken.deleteMany({
      where: {
        revokedAt: {
          not: null,
          lt: cutoffDate,
        },
      },
    });

    logger.info(`Deleted ${result.count} old revoked tokens`);
    return result.count;
  } catch (error) {
    logger.error('Error deleting revoked tokens:', error);
    throw error;
  }
}

module.exports = {
  createToken,
  findByToken,
  revokeToken,
  deleteExpiredTokens,
  deleteRevokedTokens,
};
