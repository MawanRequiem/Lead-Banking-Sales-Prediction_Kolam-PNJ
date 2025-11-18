const { prisma } = require('../config/prisma');
const logger = require('../config/logger');

/**
 * Create Sales User
 */
async function create(data) {
  try {
    const salesUser = await prisma.sales.create({
      data: {
        nama: data.nama,
        email: data.email,
        passwordHash: data.passwordHash,
        nomorTelepon: data.nomorTelepon || null,
        domisili: data.domisili || null,
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

/**
 * Find Sales by ID
 */
async function findById(id) {
  try {
    const salesUser = await prisma.sales.findUnique({
      where: {
        idSales: id,
      },
    });

    // Check if soft deleted
    if (salesUser && salesUser.deletedAt) {
      return null;
    }

    return salesUser;
  } catch (error) {
    logger.error('Error finding sales user by ID:', error);
    throw error;
  }
}

/**
 * Find All Sales with pagination and filters
 */
async function findAll(options = {}) {
  try {
    const {
      skip = 0,
      take = 10,
      isActive,
      search,
    } = options;

    const where = {
      deletedAt: null,
    };

    if (typeof isActive !== 'undefined') {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [sales, total] = await Promise.all([
      prisma.sales.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          idSales: true,
          nama: true,
          email: true,
          nomorTelepon: true,
          domisili: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.sales.count({ where }),
    ]);

    return { sales, total };
  } catch (error) {
    logger.error('Error finding all sales:', error);
    throw error;
  }
}

/**
 * Update Sales by ID
 */
async function update(id, data) {
  try {
    const salesUser = await prisma.sales.update({
      where: { idSales: id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return salesUser;
  } catch (error) {
    logger.error('Error updating sales user:', error);
    throw error;
  }
}

/**
 * Update Password
 */
async function updatePassword(id, passwordHash) {
  try {
    const salesUser = await prisma.sales.update({
      where: { idSales: id },
      data: {
        passwordHash,
        updatedAt: new Date(),
      },
    });

    return salesUser;
  } catch (error) {
    logger.error('Error updating sales password:', error);
    throw error;
  }
}

/**
 * Deactivate Sales (soft delete with timestamp)
 * Set isActive = false AND deletedAt = current timestamp
 * @param {string} id - Sales ID
 * @returns {Promise<Object>}
 */
async function deactivate(id) {
  try {
    const salesUser = await prisma.sales.update({
      where: { idSales: id },
      data: {
        isActive: false,
        deletedAt: new Date(), // ✅ Set deletedAt when deactivating
        updatedAt: new Date(),
      },
    });

    logger.info(`Sales deactivated and soft deleted: ${id}`);
    return salesUser;
  } catch (error) {
    logger.error('Error deactivating sales user:', error);
    throw error;
  }
}

/**
 * Activate Sales (restore from soft delete)
 * Set isActive = true AND deletedAt = null
 * @param {string} id - Sales ID
 * @returns {Promise<Object>}
 */
async function activate(id) {
  try {
    const salesUser = await prisma.sales.update({
      where: { idSales: id },
      data: {
        isActive: true,
        deletedAt: null, // ✅ Clear deletedAt when activating
        updatedAt: new Date(),
      },
    });

    logger.info(`Sales activated and restored: ${id}`);
    return salesUser;
  } catch (error) {
    logger.error('Error activating sales user:', error);
    throw error;
  }
}

/**
 * Soft Delete Sales (permanent deactivation)
 * This is for explicit delete operation, not just deactivate
 * @param {string} id - Sales ID
 * @returns {Promise<Object>}
 */
async function softDelete(id) {
  try {
    const salesUser = await prisma.sales.update({
      where: { idSales: id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        updatedAt: new Date(),
      },
    });

    logger.info(`Sales soft deleted: ${id}`);
    return salesUser;
  } catch (error) {
    logger.error('Error soft deleting sales user:', error);
    throw error;
  }
}

/**
 * Count Active Sales
 */
async function countActive() {
  try {
    return await prisma.sales.count({
      where: {
        isActive: true,
        deletedAt: null,
      },
    });
  } catch (error) {
    logger.error('Error counting active sales:', error);
    throw error;
  }
}

module.exports = {
  create,
  findByEmail,
  findById,
  findAll,
  update,
  updatePassword,
  deactivate,
  activate,
  softDelete,
  countActive,
};
