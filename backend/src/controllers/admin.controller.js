const adminService = require('../services/admin.service');
const { successResponse, errorResponse } = require('../utils/response.util');
const logger = require('../config/logger');

/**
 * Admin Controller
 */

/**
 * Create Admin Account
 * POST /api/admin
 */
async function createAdmin(req, res) {
  try {
    const adminData = req.body;

    const admin = await adminService.createAdmin(adminData);

    return successResponse(
      res,
      admin,
      'Admin account created successfully',
      201,
    );
  } catch (error) {
    logger.error('Error in createAdmin controller:', error);

    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }

    return errorResponse(res, 'Failed to create admin account', 500);
  }
}

module.exports = {
  createAdmin,
};
