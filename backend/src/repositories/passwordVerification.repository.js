const { prisma } = require('../config/prisma');
const logger = require('../config/logger');

async function createVerification({ token, userId, expiresAt }) {
  try {
    const rec = await prisma.passwordVerification.create({
      data: {
        token,
        idUser: userId,
        expiresAt,
      },
    });
    return rec;
  } catch (error) {
    logger.error('Error creating password verification token', error);
    throw error;
  }
}

async function findValidByToken(token) {
  try {
    const now = new Date();
    const rec = await prisma.passwordVerification.findFirst({
      where: {
        token,
        usedAt: null,
        expiresAt: { gt: now },
      },
    });
    return rec;
  } catch (error) {
    logger.error('Error finding verification token', error);
    throw error;
  }
}

async function markUsed(id) {
  try {
    const rec = await prisma.passwordVerification.update({
      where: { id },
      data: { usedAt: new Date() },
    });
    return rec;
  } catch (error) {
    logger.error('Error marking verification token used', error);
    throw error;
  }
}

module.exports = {
  createVerification,
  findValidByToken,
  markUsed,
};
