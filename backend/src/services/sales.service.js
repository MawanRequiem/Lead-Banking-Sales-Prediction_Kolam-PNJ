const salesRepository = require('../repositories/sales.repository');
const { hashPassword, validatePasswordStrength } = require('../utils/password.util');
const {
  BadRequestError,
  ConflictError,
  NotFoundError,
} = require('../middlewares/errorHandler.middleware');
const logger = require('../config/logger');
const { encryptSensitiveFields, decryptSensitiveFields } = require('../utils/prismaEncryption.util');
const { encrypt } = require('../utils/encryption.util');

/**
 * Create Sales
 */
async function createSales(data) {
  // Check if email already exists
  const existingSales = await salesRepository.findByEmail(data.email);
  if (existingSales) {
    throw new ConflictError('Email already registered', 'EMAIL_EXISTS');
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  const encryptedData = encryptSensitiveFields({
    nomorTelepon: data.nomorTelepon,
    domisili: data.domisili,
  });

  // Create sales
  const sales = await salesRepository.create({
    nama: data.nama,
    email: data.email,
    passwordHash,
    nomorTelepon: encryptedData.nomorTelepon, // Pass the encrypted version
    domisili: encryptedData.domisili,         // Pass the encrypted version
  });

  // Decrypt for the return value so the API response is readable
  const decryptedSales = decryptSensitiveFields(sales);

  // Remove sensitive data
  delete decryptedSales.user.passwordHash;

  return decryptedSales;
}

/**
 * Get Sales by ID
 */
async function getSalesById(id) {
  const sales = await salesRepository.findById(id);

  if (!sales) {
    throw new NotFoundError('Sales not found', 'SALES_NOT_FOUND');
  }

  const decryptedSales = decryptSensitiveFields(sales);

  // Remove password hash
  if (decryptedSales.user) {
    delete decryptedSales.user.passwordHash;
  }

  return decryptedSales;
}

/**
 * Get All Sales
 */
async function getAllSales(filters) {
  const { isActive } = filters;

  if (isActive !== undefined) {
    filters.isActive = isActive === 'true'; // Convert to boolean if "true" then true else false
  }

  const result = await salesRepository.findAll(filters);

  const decryptedSales = result.sales.map(sales => {
    const decrypted = decryptSensitiveFields(sales);
    if (decrypted.user) {
      delete decrypted.user.passwordHash;
    }
    return decrypted;
  });

  return {
    sales: decryptedSales,
    pagination: result.pagination,
  };
}

/**
 * Update Sales
 */
async function updateSales(id, data) {
  const existingSales = await salesRepository.findById(id);

  if (!existingSales) {
    throw new NotFoundError('Sales not found', 'SALES_NOT_FOUND');
  }

  const encryptedData = {};
  if (data.nama !== undefined) {encryptedData.nama = data.nama;}
  if (data.nomorTelepon !== undefined) {
    encryptedData.nomorTelepon = data.nomorTelepon ? encrypt(data.nomorTelepon) : null;
  }
  if (data.domisili !== undefined) {
    encryptedData.domisili = data.domisili ? encrypt(data.domisili) : null;
  }

  const updated = await salesRepository.update(id, encryptedData);

  const decryptedSales = decryptSensitiveFields(updated);
  if (decryptedSales.user) {
    delete decryptedSales.user.passwordHash;
  }

  return decryptedSales;
}

/**
 * Reset Sales Password
 */
async function resetSalesPassword(id, newPassword) {
  const existingSales = await salesRepository.findById(id);

  if (!existingSales) {
    throw new NotFoundError('Sales account not found', 'SALES_NOT_FOUND');
  }

  // Validate new password
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.valid) {
    throw new BadRequestError(
      'Password does not meet security requirements',
      'WEAK_PASSWORD',
    );
  }

  const passwordHash = await hashPassword(newPassword);

  await salesRepository.updatePassword(id, passwordHash);

  logger.audit('Password reset', {
    salesId: id,
    email: existingSales.user.email,
  });

  return { message: 'Password reset successfully' };
}

/**
 * Deactivate Sales
 */
async function deactivateSales(id) {
  const existingSales = await salesRepository.findById(id);

  if (!existingSales) {
    throw new NotFoundError('Sales account not found', 'SALES_NOT_FOUND');
  }

  if (!existingSales.user.isActive && !existingSales.user.deletedAt) {
    throw new BadRequestError(
      'Sales account is already deactivated',
      'ALREADY_DEACTIVATED',
    );
  }

  if (existingSales.user.deletedAt) {
    throw new BadRequestError(
      'Cannot deactivate a deleted account',
      'ACCOUNT_DELETED',
    );
  }

  await salesRepository.deactivate(id);

  logger.audit('Sales deactivated', {
    salesId: id,
    email: existingSales.user.email,
  });

  return {
    message: 'Sales account deactivated successfully',
    note: 'Use activate endpoint to restore access',
  };
}

/**
 * Activate Sales
 */
async function activateSales(id) {
  const existingSales = await salesRepository.findById(id, true);

  if (!existingSales) {
    throw new NotFoundError('Sales account not found', 'SALES_NOT_FOUND');
  }

  if (existingSales.user.isActive && !existingSales.user.deletedAt) {
    throw new BadRequestError(
      'Sales account is already active',
      'ALREADY_ACTIVE',
    );
  }

  await salesRepository.activate(id);

  logger.audit('Sales activated', {
    salesId: id,
    email: existingSales.user.email,
    wasDeleted: !!existingSales.user.deletedAt,
  });

  return {
    message: existingSales.user.deletedAt
      ? 'Sales account restored from deletion'
      : 'Sales account activated successfully',
  };
}

/**
 * Delete Sales (Soft Delete)
 */
async function deleteSales(id) {
  const existingSales = await salesRepository.findById(id);

  if (!existingSales) {
    throw new NotFoundError('Sales account not found', 'SALES_NOT_FOUND');
  }

  if (existingSales.user.deletedAt) {
    throw new BadRequestError(
      'Sales account is already deleted',
      'ALREADY_DELETED',
    );
  }

  await salesRepository.softDelete(id);

  logger.audit('Sales deleted (soft)', {
    salesId: id,
    email: existingSales.user.email,
  });

  return {
    message: 'Sales account deleted successfully',
    note: 'Use activate endpoint to restore if needed',
  };
}

module.exports = {
  createSales,
  getAllSales,
  getSalesById,
  updateSales,
  resetSalesPassword,
  deactivateSales,
  activateSales,
  deleteSales,
};
