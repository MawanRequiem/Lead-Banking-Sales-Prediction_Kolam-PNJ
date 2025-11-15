const adminService = require('../services/admin.service');
const salesService = require('../services/sales.service');
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

/**
 * Create Sales Account
 * POST /api/admin/sales
 */
async function createSales(req, res) {
  try {
    const salesData = req.body;

    const sales = await salesService.createSales(salesData);

    return successResponse(
      res,
      sales,
      'Sales account created successfully',
      201,
    );
  } catch (error) {
    logger.error('Error in createSales in admin controller:', error);

    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }

    return errorResponse(res, 'Failed to create sales account', 500);
  }
}

module.exports = {
  createAdmin,
  createSales,
};
