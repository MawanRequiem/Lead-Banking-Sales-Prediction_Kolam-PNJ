const adminRepository = require('../repositories/admin.repository');
const { hashPassword, validatePasswordStrength } = require('../utils/password.util');
const logger = require('../config/logger');
const {
  BadRequestError,
  ConflictError,
} = require('../utils/error.util');

/**
 * Create Admin Account
 * @param {object} data - { email, password, emailRecovery? }
 * @returns {Promise<object>}
 */
async function createAdmin(data) {
  try {
    const { email, password, emailRecovery } = data;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new BadRequestError(passwordValidation.errors.join(', '));
    }

    // Check if email already exists
    const existingAdmin = await adminRepository.findByEmail(email);
    if (existingAdmin) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create admin
    const admin = await adminRepository.create({
      email,
      passwordHash,
      emailRecovery,
    });

    logger.info(`Admin created: ${admin.idAdmin}`);

    // Return without sensitive data
    const { passwordHash: _, ...safeAdmin } = admin;
    return safeAdmin;
  } catch (error) {
    logger.error('Error in createAdmin service:', error);
    throw error;
  }
}

module.exports = {
  createAdmin,
};
