const salesOpService = require('../services/sales-operation.service');
const { successResponse } = require('../utils/response.util');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');

/**
 * Get Sales Dashboard
 * GET /api/sales/dashboard
 */
const getDashboard = asyncHandler(async (req, res) => {
  // req.user.userId didapat dari auth.middleware
  const { leads, pagination } = await salesOpService.getMyDashboard(req.user.id, req.query);

  // Response standar dengan metadata pagination
  return successResponse(
    res,
    leads,
    'Dashboard data retrieved successfully',
    { pagination }, // Meta masuk sini
  );
});

/**
 * Get leads (list nasabah) for sales
 * GET /api/sales/leads
 */
const getAllLeads = asyncHandler(async (req, res) => {
  const { leads, pagination } = await salesOpService.getAllLeads(req.query);

  return successResponse(
    res,
    leads,
    'Leads data retrieved succesfully',
    { pagination },
  );
});

/**
 * Get Call History
 * GET /api/sales/call-history
 */
const getCallHistory = asyncHandler(async (req, res) => {
  const { history, pagination } = await salesOpService.getCallHistory(req.query);

  return successResponse(
    res,
    history,
    'Call history retrieved successfully',
    { pagination },
  );
});

/**
 * Log Call Activity
 * POST /api/sales/log-call
 */
const logCall = asyncHandler(async (req, res) => {
  const result = await salesOpService.logActivity(req.user.id, req.body);
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
  const result = await salesOpService.getLeadDetail(req.params.id);
  return successResponse(res, result, 'Lead details retrieved successfully');
});

/**
 * Get Assigned Leads
 * GET /api/sales/assignments
 */
const getAssignments = asyncHandler(async (req, res) => {
  const { assignments, pagination } = await salesOpService.getMyAssignments(req.user.userId, req.query);
  return successResponse(res, assignments, 'Assigned leads retrieved successfully', { pagination });
});

module.exports = {
  getDashboard,
  getAllLeads,
  getCallHistory,
  logCall,
  exportData,
  updateStatus,
  getLeadDetail,
  getAssignments,
};
