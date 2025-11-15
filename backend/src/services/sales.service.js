const salesRepository = require('../repositories/sales.repository');
const logger = require('../config/logger');
const { hashPassword, validatePasswordStrength } = require('../utils/password.util');
const {
  BadRequestError,
  ConflictError,
} = require('../utils/error.util');

/**
 * Create Sales Account
 * @param {object} data - { nama, email, password, nomor_telepon?, domisili? }
 * @returns {Promise<object>}
 */
async function createSales(data) {
  try {
    const { nama, email, password, nomor_telepon, domisili } = data;

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

    // Create admin
    const sales = await salesRepository.create({
      nama,
      email,
      passwordHash,
      nomor_telepon,
      domisili,
    });

    logger.info(`Sales user created: ${sales.idSales}`);

    // Return without sensitive data
    const { passwordHash: _, ...safeSales } = sales;
    return safeSales;
  } catch (error) {
    logger.error('Error in createAdmin service:', error);
    throw error;
  }
}

module.exports = {
  createSales,
};
