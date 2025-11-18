const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const {
  authenticateToken,
  requireAdmin,
} = require('../middlewares/auth.middleware');
const {
  validateCreateSales,
  validateUpdateSales,
  validateResetPassword,
  validateUUIDParam,
  validateGetAllQuery,
} = require('../middlewares/validation.middleware');
const {
  writeLimiter,
  searchLimiter,
  passwordResetLimiter,
} = require('../middlewares/rateLimiter.middleware');

router.use(authenticateToken);
router.use(requireAdmin);

router.post(
  '/sales',
  writeLimiter,
  validateCreateSales,
  adminController.createSales,
);

router.get(
  '/sales',
  searchLimiter,
  validateGetAllQuery,
  adminController.getAllSales,
);

router.get(
  '/sales/:id',
  validateUUIDParam('id'),
  adminController.getSalesById,
);

router.put(
  '/sales/:id',
  writeLimiter,
  validateUUIDParam('id'),
  validateUpdateSales,
  adminController.updateSales,
);

router.post(
  '/sales/:id/reset-password',
  passwordResetLimiter,
  validateUUIDParam('id'),
  validateResetPassword,
  adminController.resetPassword,
);

router.post(
  '/sales/:id/deactivate',
  writeLimiter,
  validateUUIDParam('id'),
  adminController.deactivateSales,
);

router.post(
  '/sales/:id/activate',
  writeLimiter,
  validateUUIDParam('id'),
  adminController.activateSales,
);

router.delete(
  '/sales/:id',
  writeLimiter,
  validateUUIDParam('id'),
  adminController.deleteSales,
);

module.exports = router;
