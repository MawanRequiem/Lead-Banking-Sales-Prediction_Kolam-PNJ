const { prisma } = require('../config/prisma');
const logger = require('../config/logger');

/**
 * Admin Repository
 */

/**
 * Find Admin by Email
 * @param {string} email
 * @returns {Promise<object|null>}
 */
async function findByEmail(email) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (admin && admin.deletedAt) {
      return null;
    }

    return admin;
  } catch (error) {
    logger.error('Error finding admin by email:', error);
    throw error;
  }
}

/**
 * Create Admin
 * @param {object} data - { email, passwordHash, emailRecovery? }
 * @returns {Promise<object>}
 */
async function create(data) {
  try {
    const admin = await prisma.admin.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        emailRecovery: data.emailRecovery || null,
        isActive: true,
      },
    });

    return admin;
  } catch (error) {
    logger.error('Error creating admin:', error);
    throw error;
  }
}

/**
 * Count Active Admins
 * @returns {Promise<number>}
 */
async function countActive() {
  try {
    return await prisma.admin.count({
      where: {
        isActive: true,
        deletedAt: null,
      },
    });
  } catch (error) {
    logger.error('Error counting active admins:', error);
    throw error;
  }
}

module.exports = {
  findByEmail,
  create,
  countActive,
};
