const { prisma } = require('../config/prisma');
const logger = require('../config/logger');

async function createToken(data) {
  try {
    const token = await prisma.refreshToken.create({
      data: {
        expiresAt: data.expiresAt,
        idUser: data.userId, // ✅ NEW: harus ada userId
      },
    });

    logger.info(`Token created for user: ${data.userId}`);
    return token;
  } catch (error) {
    logger.error('Error creating token:', error);
    throw error;
  }
}

async function findByToken(tokenString) {
  try {
    const token = await prisma.refreshToken.findUnique({
      where: { token: tokenString },
      include: {
        user: true, // ✅ Include user relation
      },
    });
    return token;
  } catch (error) {
    logger.error('Error finding token:', error);
    throw error;
  }
}

async function revokeToken(tokenString, replacedBy = null) {
  try {
    const token = await prisma.refreshToken.update({
      where: { token: tokenString },
      data: {
        revokedAt: new Date(),
        replacedBy: replacedBy,
        modifiedAt: new Date(),
      },
    });

    logger.info(`Token revoked: ${tokenString}`);
    return token;
  } catch (error) {
    logger.error('Error revoking token:', error);
    throw error;
  }
}

async function deleteExpiredTokens() {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    logger.info(`Deleted ${result.count} expired tokens`);
    return result.count;
  } catch (error) {
    logger.error('Error deleting expired tokens:', error);
    throw error;
  }
}

module.exports = {
  createToken,
  findByToken,
  revokeToken,
  deleteExpiredTokens,
};
