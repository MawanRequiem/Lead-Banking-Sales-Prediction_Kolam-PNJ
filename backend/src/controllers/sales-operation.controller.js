const salesOpService = require('../services/sales-operation.service');
const { successResponse } = require('../utils/response.util');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');

/**
 * Get Sales Dashboard
 * GET /api/sales/dashboard
 */
const getDashboard = asyncHandler(async (req, res) => {
  // req.user.userId didapat dari auth.middleware
  const { leads, pagination } = await salesOpService.getMyDashboard(req.user.userId, req.query);

  // Response standar dengan metadata pagination
  return successResponse(
    res,
    leads,
    'Dashboard data retrieved successfully',
    { pagination }, // Meta masuk sini
  );
});

/**
 * Log Call Activity
 * POST /api/sales/log-call
 */
const logCall = asyncHandler(async (req, res) => {
  const result = await salesOpService.logActivity(req.user.userId, req.body);
  return successResponse(res, result, 'Call logged successfully', 201);
});

/**
 * Export Data to CSV
 * GET /api/sales/export
 */
const exportData = asyncHandler(async (req, res) => {
  const csvData = await salesOpService.exportWorkReport(req.user.userId);

  // Set Header untuk download file
  const filename = `laporan-kerja-${new Date().toISOString().split('T')[0]}.csv`;
  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', `attachment; filename="${filename}"`);

  return res.send(csvData);
});

/**
 * Update Lead Status
 * PATCH /api/sales/status
 */
const updateStatus = asyncHandler(async (req, res) => {
  const result = await salesOpService.updateLeadStatus(req.user.userId, req.body);
  return successResponse(res, result, 'Status updated successfully');
});

/**
 * Get Lead Details
 * GET /api/sales/leads/:id
 */
const getLeadDetail = asyncHandler(async (req, res) => {
  const result = await salesOpService.getLeadDetail(req.user.userId, req.params.id);
  return successResponse(res, result, 'Lead details retrieved successfully');
});

module.exports = {
  getDashboard,
  logCall,
  exportData,
  updateStatus,
  getLeadDetail,
};
