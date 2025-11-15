const { prisma } = require('../config/prisma');
const logger = require('../config/logger');

async function createToken(data) {
  try {
    const token = await prisma.refreshTokens.create({
      data: {
        expires_at: data.expiresAt,
      },
    });

    return token;
  } catch (error) {
    logger.error('Error creating token:', error);
    throw error;
  }
}

module.exports = {
  createToken,
};
