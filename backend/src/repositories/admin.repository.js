const { prisma } = require('../config/prisma');
const logger = require('../config/logger');

/**
 * Create Admin with User
 */
async function create(data) {
  try {
    const admin = await prisma.admin.create({
      data: {
        emailRecovery: data.emailRecovery || null,
        user: {
          create: {
            email: data.email,
            passwordHash: data.passwordHash,
            isActive: true,
          },
        },
      },
      include: {
        user: true,
      },
    });

    return admin;
  } catch (error) {
    logger.error('Error creating admin:', error);
    throw error;
  }
}

/**
 * Find Admin by Email
 */
async function findByEmail(email) {
  try {
    const admin = await prisma.admin.findFirst({
      where: {
        user: {
          email: email,
          deletedAt: null,
        },
      },
      include: {
        user: true,
      },
    });

    return admin;
  } catch (error) {
    logger.error('Error finding admin by email:', error);
    throw error;
  }
}

/**
 * Find Admin by ID
 */
async function findById(id) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { idAdmin: id },
      include: {
        user: true,
      },
    });

    if (admin && admin.user.deletedAt) {
      return null;
    }

    return admin;
  } catch (error) {
    logger.error('Error finding admin by ID:', error);
    throw error;
  }
}

async function findByUserId(userId, includeSoftDeleted = false) {
  try {
    const admin = await prisma.admin.findFirst({
      where: { idUser: userId },
      include: {
        user: true,
      },
    });

    if (admin && admin.user.deletedAt && !includeSoftDeleted) {
      return null;
    }

    return admin;
  } catch (error) {
    logger.error('Error finding admin by User ID:', error);
    throw error;
  }
}

/**
 * Update Password
 */
async function updatePassword(adminId, passwordHash) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { idAdmin: adminId },
    });

    if (!admin) {
      throw new Error('Admin not found');
    }

    await prisma.user.update({
      where: { idUser: admin.idUser },
      data: {
        passwordHash,
        modifiedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    logger.error('Error updating admin password:', error);
    throw error;
  }
}

module.exports = {
  create,
  findByEmail,
  findById,
  findByUserId,
  updatePassword,
};
