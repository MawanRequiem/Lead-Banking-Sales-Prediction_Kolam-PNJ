const salesOpService = require('../services/sales-operation.service');
const { successResponse } = require('../utils/response.util');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');

/**
 * Dashboard: recent call history peek (default 10)
 * GET /api/sales/dashboard/call-history
 */
const getDashboardCallHistory = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit || '10', 10);
  const salesId = req.user?.userId; // use domain id (idSales) from token payload

  const rows = await salesOpService.getCallHistoryForDash({ limit, salesId });
  return successResponse(res, rows, 'Dashboard call history retrieved');
});

/**
 * Dashboard: assignment suggestions (default 5)
 * GET /api/sales/dashboard/assignments
 */
const getDashboardAssignments = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit || '5', 10);
  const salesId = req.user?.userId;

  const rows = await salesOpService.getAssignmentsForDash(salesId, limit);
  return successResponse(res, rows, 'Dashboard assignments retrieved');
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
  const csvData = await salesOpService.exportWorkReport(req.user?.userId);

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
  const result = await salesOpService.updateLeadStatus(req.user?.userId, req.body);
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

/**
 * Dashboard: deposit conversion chart (per interval)
 * GET /api/sales/dashboard/deposits/conversion
 */
const getDashboardDepositsConversion = asyncHandler(async (req, res) => {
  const { startDate, endDate, interval = 'month', successSet = 'TERKONEKSI', salesId } = req.query;
  // prefer explicit `successSet` query param, fallback to `status` for backward compatibility
  const successParam = successSet || 'TERKONEKSI';

  const rows = await salesOpService.getDepositConversionForDash(
    { startDate, endDate, interval, successSet: successParam, salesId },
  );
  return successResponse(res, rows, 'Deposit conversion data retrieved');
});

/**
 * Dashboard: deposit types (counts by jenisDeposito)
 * GET /api/sales/dashboard/deposits/types
 */
const getDashboardDepositsTypes = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const status = 'AKTIF';
  const rows = await salesOpService.getDepositTypesForDash({ startDate, endDate, status });
  return successResponse(res, rows, 'Deposit types data retrieved');
});

/**
 * Combined Dashboard Summary
 * GET /api/sales/dashboard
 * Returns: { callHistory, assignments, depositsConversion, depositTypes, errors }
 * it will replace the previous single-purpose endpoints for dashboard data
 */
const getDashboardSummary = asyncHandler(async (req, res) => {
  let { startDate, endDate, year, month } = req.query;
  const { interval = 'month', successSet = 'AKTIF', callsLimit = '10', assignmentsLimit = '5' } = req.query;

  let wholeYear = false;
  // If frontend provided year/month but not explicit startDate/endDate,
  // compute the ISO date range for that year/month on server side so frontend
  // only needs to send year/month. If no year provided, default to current month/year.
  if (!year) {
    const now = new Date();
    year = String(now.getUTCFullYear());
    month = String(now.getUTCMonth() + 1);
  }

  if (year) {
    const y = parseInt(year, 10);
    if (Number.isInteger(y)) {
      if (month) {
        // Ada month = Monthly view (1 bulan dengan weekly interval)
        const m = parseInt(month, 10);
        if (Number.isInteger(m) && m >= 1 && m <= 12) {
          wholeYear = false;
          const s = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
          const e = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999)); // last day of month
          startDate = startDate || s.toISOString();
          endDate = endDate || e.toISOString();
        }
      } else {
        // Tidak ada month = Yearly view (1 tahun dengan monthly interval)
        wholeYear = true;
        const s = new Date(Date.UTC(y, 0, 1, 0, 0, 0));
        const e = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
        startDate = startDate || s.toISOString();
        endDate = endDate || e.toISOString();
      }
    }
  }

  const buildInterval = () => {
    if (interval) {return interval;}
    if (wholeYear) {return 'month';}
    return 'week';
  };
  const intervalFinal = buildInterval();
  const salesId = req.user?.id;

  const tasks = {
    callHistory: salesOpService.getCallHistoryForDash({ limit: parseInt(callsLimit, 10), salesId }),
    assignments: salesOpService.getAssignmentsForDash(req.user, parseInt(assignmentsLimit, 10)),
    depositsConversion: salesOpService.getDepositConversionForDash(
      { startDate, endDate, interval: intervalFinal, successSet, salesId },
    ),
    depositTypes: salesOpService.getDepositTypesForDash({ startDate, endDate }),
  };

  const results = await Promise.allSettled(Object.values(tasks));
  const keys = Object.keys(tasks);

  const payload = {};
  const errors = [];

  results.forEach((r, idx) => {
    const k = keys[idx];
    if (r.status === 'fulfilled') {payload[k] = r.value;}
    else {
      payload[k] = null;
      errors.push({ key: k, reason: r.reason && r.reason.message ? r.reason.message : String(r.reason) });
    }
  });

  return successResponse(res, payload, 'Dashboard summary retrieved', { errors: errors.length ? errors : undefined });
});

module.exports = {
  getAllLeads,
  getCallHistory,
  logCall,
  exportData,
  updateStatus,
  getLeadDetail,
  getAssignments,
  // controller for all dashboard endpoint
  getDashboardCallHistory,
  getDashboardAssignments,
  getDashboardDepositsConversion,
  getDashboardDepositsTypes,
  // controller for all dashboard data
  getDashboardSummary,
};
