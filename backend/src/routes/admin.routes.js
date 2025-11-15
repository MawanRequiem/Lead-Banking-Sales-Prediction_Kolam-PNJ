const express = require('express');
const adminController = require('../controllers/admin.controller');
const { validate } = require('../middlewares/validation.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { createAdminSchema } = require('../validators/admin.validator');
const {
  createSalesSchema,
  updateSalesSchema,
  resetPasswordSchema,
} = require('../validators/sales.validator');

const router = express.Router();

/**
 * Admin Routes
 * Base path: /api/admin
 * All routes require admin authentication
 */

// Apply authentication middleware to all admin routes
router.use(requireAuth);
router.use(requireRole(['admin']));

/**
 * @route POST /api/admin
 * @desc Create new admin account
 * @access Admin only
 */
router.post(
  '/',
  validate(createAdminSchema),
  adminController.createAdmin,
);

/**
 * @route POST /api/admin/sales
 * @desc Create new sales account
 * @access Admin only
 */
router.post(
  '/sales',
  validate(createSalesSchema),
  adminController.createSales,
);

/**
 * @route GET /api/admin/sales
 * @desc Get all sales accounts with pagination and filters
 * @access Admin only
 */
router.get(
  '/sales',
  adminController.getAllSales,
);

/**
 * @route GET /api/admin/sales/:id
 * @desc Get sales account details by ID
 * @access Admin only
 */
router.get(
  '/sales/:id',
  adminController.getSalesById,
);

/**
 * @route PUT /api/admin/sales/:id
 * @desc Update sales account
 * @access Admin only
 */
router.put(
  '/sales/:id',
  validate(updateSalesSchema),
  adminController.updateSales,
);

/**
 * @route POST /api/admin/sales/:id/reset-password
 * @desc Reset password for sales account
 * @access Admin only
 */
router.post(
  '/sales/:id/reset-password',
  validate(resetPasswordSchema),
  adminController.resetSalesPassword,
);

/**
 * @route POST /api/admin/sales/:id/deactivate
 * @desc Deactivate sales account (soft delete)
 * @access Admin only
 */
router.post(
  '/sales/:id/deactivate',
  adminController.deactivateSales,
);

/**
 * @route POST /api/admin/sales/:id/activate
 * @desc Activate sales account
 * @access Admin only
 */
router.post(
  '/sales/:id/activate',
  adminController.activateSales,
);

/**
 * @route DELETE /api/admin/sales/:id
 * @desc Permanently delete sales account
 * @access Admin only
 */
router.delete(
  '/sales/:id',
  adminController.deleteSales,
);

module.exports = router;
