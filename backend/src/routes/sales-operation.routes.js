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
} = require('../middlewares/validation.middleware');

// Global Middleware untuk router ini
router.use(authenticateToken);
router.use(requireSales);

function debug(req, res, next) {
  console.log('[DEBUG] Raw incoming body:', req.body);
  next();
}

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

// Dashboard-specific peek endpoints removed. Use GET /dashboard with params instead.

// Note: combined summary is now served by GET /dashboard when summary params are present

/**
 * Export Route
 * Secured with Search Rate Limit
 */
router.get(
  '/export',
  searchLimiter,
  controller.exportCallHistory,
);

/**
 * Log Call Route
 * Secured with Write Rate Limit & Strict Validation
 */
router.post(
  '/log-call',
  debug,
  writeLimiter,     // Mencegah spam klik tombol save
  validateLogCall,  // <--- Validasi aktif di sini!
  controller.logCall,
);

router.patch(
  '/status',
  writeLimiter,
  validateUpdateStatus,
  controller.updateStatus,
);

router.get(
  '/leads',
  validateGetAllQuery,
  controller.getAllLeads,
);

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

router.get(
  '/assignments',
  searchLimiter,
  validateGetAllQuery,
  controller.getAssignments,
);

module.exports = router;
