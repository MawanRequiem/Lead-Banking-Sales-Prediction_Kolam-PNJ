const adminService = require('../services/admin.service');
const salesService = require('../services/sales.service');
const {
  successResponse,
  createdResponse,
} = require('../utils/response.util');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');

/**
 * Create Admin Account
 */
const createAdmin = asyncHandler(async (req, res) => {
  const adminData = req.body;
  const admin = await adminService.createAdmin(adminData);

  return successResponse(res, admin, 'Admin account created successfully', 201);
});

/**
 * Create Sales Account
 * POST /api/admin/sales
 */
const createSales = asyncHandler(async (req, res) => {
  const result = await salesService.createSales(req.body);

  return createdResponse(
    res,
    result,
    'Sales account created successfully',
    `/api/admin/sales/${result.idSales}`,
  );
});

/**
 * Get All Sales
 * GET /api/admin/sales
 */
const getAllSales = asyncHandler(async (req, res) => {
  const { sales, pagination } = await salesService.getAllSales(req.query);

  return successResponse(
    res,
    { sales },
    'Sales list retrieved successfully',
    { pagination },
  );
});

/**
 * Get Sales By ID
 * GET /api/admin/sales/:id
 */
const getSalesById = asyncHandler(async (req, res) => {
  const sales = await salesService.getSalesById(req.params.id);

  return successResponse(
    res,
    sales,
    'Sales details retrieved successfully',
  );
});

/**
 * Update Sales
 * PUT /api/admin/sales/:id
 */
const updateSales = asyncHandler(async (req, res) => {
  const updated = await salesService.updateSales(req.params.id, req.body);

  return successResponse(
    res,
    updated,
    'Sales account updated successfully',
  );
});

/**
 * Reset Sales Password
 * POST /api/admin/sales/:id/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const result = await salesService.resetSalesPassword(
    req.params.id,
    req.body.newPassword,
  );

  return successResponse(
    res,
    result,
    'Password reset successfully',
  );
});

/**
 * Deactivate Sales
 * POST /api/admin/sales/:id/deactivate
 */
const deactivateSales = asyncHandler(async (req, res) => {
  const result = await salesService.deactivateSales(req.params.id);

  return successResponse(
    res,
    result,
    'Sales account deactivated successfully',
  );
});

/**
 * Activate Sales
 * POST /api/admin/sales/:id/activate
 */
const activateSales = asyncHandler(async (req, res) => {
  const result = await salesService.activateSales(req.params.id);

  return successResponse(
    res,
    result,
    'Sales account activated successfully',
  );
});

/**
 * Delete Sales (Soft Delete)
 * DELETE /api/admin/sales/:id
 */
const deleteSales = asyncHandler(async (req, res) => {
  const result = await salesService.deleteSales(req.params.id);

  return successResponse(
    res,
    result,
    'Sales account deleted successfully',
  );
});

module.exports = {
  createAdmin,
  createSales,
  getAllSales,
  getSalesById,
  updateSales,
  resetPassword,
  deactivateSales,
  activateSales,
  deleteSales,
};
