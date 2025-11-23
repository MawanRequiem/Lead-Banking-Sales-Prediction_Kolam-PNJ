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
  validateLogCall,
  validateUpdateStatus,
  validateUUIDParam,
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
  validateGetAllQuery, // Validasi page, limit, search, sortBy
  controller.getDashboard,
);

/**
 * Log Call Route
 * Secured with Write Rate Limit (Anti-Spam)
 */
router.post(
  '/log-call',
  writeLimiter,
  // TODO: Tambahkan 'validateLogCall' di validation.middleware.js untuk validasi body (nasabahId, hasil, dll)
  controller.logCall,
);

/**
 * Export Route
 * Secured with Search Rate Limit
 */
router.get(
  '/export',
  searchLimiter,
  controller.exportData,
);

/**
 * Log Call Route
 * Secured with Write Rate Limit & Strict Validation
 */
router.post(
  '/log-call',
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
