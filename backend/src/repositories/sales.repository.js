const { prisma } = require('../config/prisma');
const logger = require('../config/logger');

/**
 * Create Sales with User
 */
async function create(data) {
  try {
    const sales = await prisma.sales.create({
      data: {
        nama: data.nama,
        nomorTelepon: data.nomorTelepon || null,
        domisili: data.domisili || null,
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

    return sales;
  } catch (error) {
    logger.error('Error creating sales:', error);
    throw error;
  }
}

/**
 * Find Sales by Email
 */
async function findByEmail(email) {
  try {
    const sales = await prisma.sales.findFirst({
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

    return sales;
  } catch (error) {
    logger.error('Error finding sales by email:', error);
    throw error;
  }
}

/**
 * Find Sales by ID
 */
async function findById(id, includeSoftDeleted = false) {
  try {
    const sales = await prisma.sales.findUnique({
      where: { idSales: id },
      include: {
        user: true,
      },
    });

    if (sales && sales.user.deletedAt && !includeSoftDeleted) {
      return null;
    }

    return sales;
  } catch (error) {
    logger.error('Error finding sales by ID:', error);
    throw error;
  }
}

async function findByUserId(userId, includeSoftDeleted = false) {
  try {
    const sales = await prisma.sales.findFirst({
      where: { idUser: userId },
      include: {
        user: true,
      },
    });

    if (sales && sales.user.deletedAt && !includeSoftDeleted) {
      return null;
    }

    return sales;
  } catch (error) {
    logger.error('Error finding sales by User ID:', error);
    throw error;
  }
}

/**
 * Find All Sales
 */
async function findAll(options = {}) {
  try {
    const { skip = 0, take = 10, isActive, search } = options;

    const where = {
      user: {
        deletedAt: null,
      },
    };

    if (typeof isActive !== 'undefined') {
      where.user.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [sales, total] = await Promise.all([
      prisma.sales.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
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
 * Update Sales
 */
async function update(id, data) {
  try {
    const updateData = {
      updatedAt: new Date(),
    };

    if (data.nama) {updateData.nama = data.nama;}
    if (data.nomorTelepon !== undefined) {updateData.nomorTelepon = data.nomorTelepon;}
    if (data.domisili !== undefined) {updateData.domisili = data.domisili;}

    const sales = await prisma.sales.update({
      where: { idSales: id },
      data: updateData,
      include: {
        user: true,
      },
    });

    // If email needs update, update user table
    if (data.email) {
      await prisma.user.update({
        where: { idUser: sales.idUser },
        data: {
          email: data.email,
          modifiedAt: new Date(),
        },
      });
    }

    return sales;
  } catch (error) {
    logger.error('Error updating sales:', error);
    throw error;
  }
}

/**
 * Update Password
 */
async function updatePassword(salesId, passwordHash) {
  try {
    const sales = await prisma.sales.findUnique({
      where: { idSales: salesId },
    });

    if (!sales) {
      throw new Error('Sales not found');
    }

    await prisma.user.update({
      where: { idUser: sales.idUser },
      data: {
        passwordHash,
        modifiedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    logger.error('Error updating password:', error);
    throw error;
  }
}

/**
 * Deactivate Sales (Temporary)
 * Only set isActive = false, keep deletedAt = null
 * Can be re-activated anytime
 */
async function deactivate(id) {
  try {
    const sales = await prisma.sales.findUnique({
      where: { idSales: id },
      select: { idUser: true },
    });

    if (!sales) {
      throw new Error('Sales not found');
    }

    await prisma.user.update({
      where: { idUser: sales.idUser },
      data: {
        isActive: false,
        modifiedAt: new Date(),
      },
    });

    logger.info(`Sales deactivated (temporary): ${id}`);
    return { success: true };
  } catch (error) {
    logger.error('Error deactivating sales:', error);
    throw error;
  }
}

/**
 * Activate Sales
 * Set isActive = true
 */
async function activate(id) {
  try {
    const sales = await prisma.sales.findUnique({
      where: { idSales: id },
      select: { idUser: true },
    });

    if (!sales) {
      throw new Error('Sales not found');
    }

    await prisma.user.update({
      where: { idUser: sales.idUser },
      data: {
        isActive: true,
        deletedAt: null, // Clear deletedAt (in case it was soft deleted)
        modifiedAt: new Date(),
      },
    });

    logger.info(`Sales activated: ${id}`);
    return { success: true };
  } catch (error) {
    logger.error('Error activating sales:', error);
    throw error;
  }
}

/**
 * Soft Delete Sales (Permanent)
 * Set both isActive = false AND deletedAt = timestamp
 * Marks record as "deleted" for audit purposes
 */
async function softDelete(id) {
  try {
    const sales = await prisma.sales.findUnique({
      where: { idSales: id },
      select: { idUser: true },
    });

    if (!sales) {
      throw new Error('Sales not found');
    }

    await prisma.user.update({
      where: { idUser: sales.idUser },
      data: {
        isActive: false,
        deletedAt: new Date(), // Mark as deleted
        modifiedAt: new Date(),
      },
    });

    logger.info(`Sales soft deleted (permanent): ${id}`);
    return { success: true };
  } catch (error) {
    logger.error('Error soft deleting sales:', error);
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
        user: {
          isActive: true,
          deletedAt: null,
        },
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
  findByUserId,
  findAll,
  update,
  updatePassword,
  deactivate,
  activate,
  softDelete,
  countActive,
};
