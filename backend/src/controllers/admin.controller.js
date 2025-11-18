const adminService = require('../services/admin.service');
const salesService = require('../services/sales.service');
const { successResponse, errorResponse } = require('../utils/response.util');
const logger = require('../config/logger');

/**
 * Create Admin Account
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
    logger.error('Error in createSales controller:', error);
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return errorResponse(res, 'Failed to create sales account', 500);
  }
}

/**
 * Get All Sales Accounts
 */
async function getAllSales(req, res) {
  try {
    const { page, limit, isActive, search } = req.query;

    const result = await salesService.getAllSales({
      page,
      limit,
      isActive,
      search,
    });

    return successResponse(
      res,
      result,
      'Sales accounts retrieved successfully',
    );
  } catch (error) {
    logger.error('Error in getAllSales controller:', error);
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return errorResponse(res, 'Failed to retrieve sales accounts', 500);
  }
}

/**
 * Get Sales by ID
 */
async function getSalesById(req, res) {
  try {
    const { id } = req.params;
    const sales = await salesService.getSalesById(id);

    return successResponse(
      res,
      sales,
      'Sales account retrieved successfully',
    );
  } catch (error) {
    logger.error('Error in getSalesById controller:', error);
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return errorResponse(res, 'Failed to retrieve sales account', 500);
  }
}

/**
 * Update Sales Account
 */
async function updateSales(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const sales = await salesService.updateSales(id, updateData);

    return successResponse(
      res,
      sales,
      'Sales account updated successfully',
    );
  } catch (error) {
    logger.error('Error in updateSales controller:', error);
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return errorResponse(res, 'Failed to update sales account', 500);
  }
}

/**
 * Reset Sales Password
 */
async function resetSalesPassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const result = await salesService.resetSalesPassword(id, newPassword);

    return successResponse(
      res,
      result,
      'Password reset successfully',
    );
  } catch (error) {
    logger.error('Error in resetSalesPassword controller:', error);
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return errorResponse(res, 'Failed to reset password', 500);
  }
}

/**
 * Deactivate Sales Account
 */
async function deactivateSales(req, res) {
  try {
    const { id } = req.params;
    const result = await salesService.deactivateSales(id);

    return successResponse(
      res,
      result,
      'Sales account deactivated successfully',
    );
  } catch (error) {
    logger.error('Error in deactivateSales controller:', error);
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return errorResponse(res, 'Failed to deactivate sales account', 500);
  }
}

/**
 * Activate Sales Account
 */
async function activateSales(req, res) {
  try {
    const { id } = req.params;
    const result = await salesService.activateSales(id);

    return successResponse(
      res,
      result,
      'Sales account activated successfully',
    );
  } catch (error) {
    logger.error('Error in activateSales controller:', error);
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return errorResponse(res, 'Failed to activate sales account', 500);
  }
}

/**
 * Delete Sales Account
 */
async function deleteSales(req, res) {
  try {
    const { id } = req.params;
    const result = await salesService.deleteSales(id);

    return successResponse(
      res,
      result,
      'Sales account deleted successfully',
    );
  } catch (error) {
    logger.error('Error in deleteSales controller:', error);
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    return errorResponse(res, 'Failed to delete sales account', 500);
  }
}

module.exports = {
  createAdmin,
  createSales,
  getAllSales,
  getSalesById,
  updateSales,
  resetSalesPassword,
  deactivateSales,
  activateSales,
  deleteSales,
};
