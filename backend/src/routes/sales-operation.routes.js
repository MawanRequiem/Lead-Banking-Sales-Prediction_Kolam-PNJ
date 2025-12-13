const express = require('express');
const router = express.Router();
const controller = require('../controllers/sales-operation.controller');
const {
  authenticateToken,
  requireSales,
} = require('../middlewares/auth.middleware');
const {
  searchLimiter,
  writeLimiter,
} = require('../middlewares/rateLimiter.middleware');
const {
  validateGetAllQuery,
  validateCallHistoryQuery,
  validateLogCall,
  validateUpdateStatus,
  validateUUIDParam,
  validateDashboardQuery,
  validateLeadsOverviewQuery,
} = require('../middlewares/validation.middleware');

// Global Middleware untuk router ini
router.use(authenticateToken);
router.use(requireSales);


/**
 * Dashboard Route
 * Secured with Search Rate Limit & Query Validation
 */
router.get(
  '/dashboard',
  searchLimiter,
  validateDashboardQuery, // Validate dashboard params (year/month/summary/etc.)
  controller.getDashboardSummary,
);

/**
 * Export Route
 * Secured with Search Rate Limit
 */
router.get(
  '/export',
  searchLimiter,
  validateCallHistoryQuery,
  controller.exportCallHistory,
);

/**
 * Log Call Route
 * Secured with Write Rate Limit & Strict Validation
 */
router.post(
  '/log-call',
  writeLimiter,
  validateLogCall,
  controller.logCall,
);

router.patch(
  '/status',
  writeLimiter,
  validateUpdateStatus,
  controller.updateStatus,
);

/**
 * Get All Nasabah
 * GET /api/sales/leads
 */
router.get(
  '/leads',
  searchLimiter,
  validateGetAllQuery,
  controller.getAllLeads,
);

/**
 * Get Leads Overview
 * GET /api/sales/leads/overview
 */
router.get(
  '/leads/overview',
  validateLeadsOverviewQuery,
  controller.getAllLeadsOverview,
);

/**
 * Get Assignments Overview
 * GET /api/sales/assignments/overview
 */
router.get(
  '/assignments/overview',
  validateLeadsOverviewQuery,
  controller.getMyLeadsOverview,
);

/**
 * Get Call History
 * GET /api/sales/call-history
 */
router.get(
  '/call-history',
  validateCallHistoryQuery,
  controller.getCallHistory,
);

/**
 * Get Detail Nasabah
 * GET /api/sales/leads/:id
 */
router.get(
  '/leads/:id',
  validateUUIDParam('id'), // Validasi parameter :id harus UUID
  controller.getLeadDetail,
);

/**
 * Get Assignments
 * GET /api/sales/assignments
 */
router.get(
  '/assignments',
  searchLimiter,
  validateGetAllQuery,
  controller.getAssignments,
);

module.exports = router;
