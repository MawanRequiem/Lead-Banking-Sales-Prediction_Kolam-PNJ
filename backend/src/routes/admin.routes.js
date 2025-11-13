const express = require('express');
const adminController = require('../controllers/admin.controller');
const { validate } = require('../middlewares/validation.middleware');
const { createAdminSchema } = require('../validators/admin.validator');

const router = express.Router();

/**
 * Admin Routes
 * Base path: /api/admin
 */

/**
 * @route   POST /api/admin
 * @desc    Create new admin account
 * @access  Public (for now - should be protected in production)
 */
router.post(
  '/',
  validate(createAdminSchema),
  adminController.createAdmin,
);

module.exports = router;
