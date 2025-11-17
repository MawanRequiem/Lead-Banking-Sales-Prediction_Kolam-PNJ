const salesRepository = require('../repositories/sales.repository');
const logger = require('../config/logger');
const { hashPassword, validatePasswordStrength } = require('../utils/password.util');
const {
  BadRequestError,
  ConflictError,
  NotFoundError,
} = require('../utils/error.util');

/**
 * Create Sales Account
 */
async function createSales(data) {
  try {
    const { nama, email, password, nomorTelepon, domisili } = data;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new BadRequestError(passwordValidation.errors.join(', '));
    }

    // Check if email already exists
    const existingSales = await salesRepository.findByEmail(email);
    if (existingSales) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create sales
    const sales = await salesRepository.create({
      nama,
      email,
      passwordHash,
      nomorTelepon,
      domisili,
    });

    logger.info(`Sales user created: ${sales.idSales}`);

    // Return without sensitive data
    const { passwordHash: _, ...safeSales } = sales;
    return safeSales;
  } catch (error) {
    logger.error('Error in createSales service:', error);
    throw error;
  }
}

/**
 * Get All Sales with pagination
 */
async function getAllSales(options = {}) {
  try {
    const {
      page = 1,
      limit = 10,
      isActive,
      search,
    } = options;

    const skip = (page - 1) * limit;

    const result = await salesRepository.findAll({
      skip,
      take: parseInt(limit),
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      search,
    });

    return {
      sales: result.sales,
      pagination: {
        total: result.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(result.total / limit),
      },
    };
  } catch (error) {
    logger.error('Error in getAllSales service:', error);
    throw error;
  }
}

/**
 * Get Sales by ID
 */
async function getSalesById(id) {
  try {
    const sales = await salesRepository.findById(id);

    if (!sales) {
      throw new NotFoundError('Sales account not found');
    }

    // Return without sensitive data
    const { passwordHash: _, ...safeSales } = sales;
    return safeSales;
  } catch (error) {
    logger.error('Error in getSalesById service:', error);
    throw error;
  }
}

/**
 * Update Sales Account
 */
async function updateSales(id, data) {
  try {
    const { nama, email, nomorTelepon, domisili } = data;

    // Check if sales exists
    const existingSales = await salesRepository.findById(id);
    if (!existingSales) {
      throw new NotFoundError('Sales account not found');
    }

    // Check if email is being changed and already exists
    if (email && email !== existingSales.email) {
      const emailExists = await salesRepository.findByEmail(email);
      if (emailExists) {
        throw new ConflictError('Email already registered');
      }
    }

    // Update sales
    const updateData = {};
    if (nama) {updateData.nama = nama;}
    if (email) {updateData.email = email;}
    if (nomorTelepon !== undefined) {updateData.nomorTelepon = nomorTelepon;}
    if (domisili !== undefined) {updateData.domisili = domisili;}

    const updatedSales = await salesRepository.update(id, updateData);

    logger.info(`Sales user updated: ${id}`);

    // Return without sensitive data
    const { passwordHash: _, ...safeSales } = updatedSales;
    return safeSales;
  } catch (error) {
    logger.error('Error in updateSales service:', error);
    throw error;
  }
}

/**
 * Reset Sales Password (Admin only)
 */
async function resetSalesPassword(id, newPassword) {
  try {
    // Check if sales exists
    const existingSales = await salesRepository.findById(id);
    if (!existingSales) {
      throw new NotFoundError('Sales account not found');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new BadRequestError(passwordValidation.errors.join(', '));
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await salesRepository.updatePassword(id, passwordHash);

    logger.info(`Sales password reset: ${id}`);

    return { message: 'Password reset successfully' };
  } catch (error) {
    logger.error('Error in resetSalesPassword service:', error);
    throw error;
  }
}

/**
 * Deactivate Sales Account
 * Now also sets deletedAt timestamp
 */
/**
 * Deactivate Sales Account
 * Sets isActive = false AND deletedAt = current timestamp
 * @param {string} id - Sales ID
 * @returns {Promise<Object>}
 */
async function deactivateSales(id) {
  try {
    // Check if sales exists
    const existingSales = await salesRepository.findById(id);
    if (!existingSales) {
      throw new NotFoundError('Sales account not found');
    }

    // Check if already deactivated
    if (!existingSales.isActive) {
      throw new BadRequestError('Sales account is already deactivated');
    }

    // Deactivate sales (will also set deletedAt)
    await salesRepository.deactivate(id);

    logger.info(`Sales user deactivated with soft delete: ${id}`);

    return {
      message: 'Sales account deactivated successfully',
      details: {
        id: id,
        deactivatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    logger.error('Error in deactivateSales service:', error);
    throw error;
  }
}

/**
 * Activate Sales Account
 * Sets isActive = true AND deletedAt = null (restore)
 * @param {string} id - Sales ID
 * @returns {Promise<Object>}
 */
async function activateSales(id) {
  try {
    // Find sales even if soft deleted
    const existingSales = await salesRepository.findUnique({
      where: { idSales: id },
    });

    if (!existingSales) {
      throw new NotFoundError('Sales account not found');
    }

    // Check if already active
    if (existingSales.isActive && !existingSales.deletedAt) {
      throw new BadRequestError('Sales account is already active');
    }

    // Activate sales (will also clear deletedAt)
    await salesRepository.activate(id);

    logger.info(`Sales user activated and restored: ${id}`);

    return {
      message: 'Sales account activated successfully',
      details: {
        id: id,
        restoredAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    logger.error('Error in activateSales service:', error);
    throw error;
  }
}

/**
 * Delete Sales Account (Soft Delete)
 * This method stays the same - already sets deletedAt via repository
 */
async function deleteSales(id) {
  try {
    // Check if sales exists
    const existingSales = await salesRepository.findById(id);
    if (!existingSales) {
      throw new NotFoundError('Sales account not found');
    }

    // Soft delete sales
    await salesRepository.softDelete(id);

    logger.info(`Sales user deleted: ${id}`);

    return { message: 'Sales account deleted successfully' };
  } catch (error) {
    logger.error('Error in deleteSales service:', error);
    throw error;
  }
}

// ⚠️ PENTING: Export semua method yang dibutuhkan
module.exports = {
  createSales,
  getAllSales,
  getSalesById,
  updateSales,
  resetSalesPassword,  // ✅ Tambahkan ini
  deactivateSales,
  activateSales,
  deleteSales,
};
