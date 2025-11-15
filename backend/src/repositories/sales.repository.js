const { prisma } = require('../config/prisma');
const logger = require('../config/logger');

/**
 * Create Sales User
 * @param {object} data - { nama, email, passwordHash, nomor_telepon?, domisili? }
 * @returns {Promise<object>}
 */
async function create(data) {
  try {
    const salesUser = await prisma.sales.create({
      data: {
        nama: data.nama,
        email: data.email,
        passwordHash: data.passwordHash,
        isActive: true,
      },
    });

    return salesUser;
  } catch (error) {
    logger.error('Error creating sales user:', error);
    throw error;
  }
}

/**
 * Find Sales by Email
 * @param {string} email
 * @returns {Promise<object|null>}
 */
async function findByEmail(email) {
  try {
    const salesUser = await prisma.sales.findUnique({
      where: { email },
    });

    if (salesUser && salesUser.deletedAt) {
      return null;
    }

    return salesUser;
  } catch (error) {
    logger.error('Error finding sales user by email:', error);
    throw error;
  }
}

module.exports = {
  create,
  findByEmail,
};
