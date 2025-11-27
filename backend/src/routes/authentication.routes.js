const express = require('express');
const router = express.Router();
const authController = require('../controllers/authentication.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { validateLogin, validateRefreshToken, validateLogout, validateVerifyCurrent, validateChangePassword } = require('../middlewares/validation.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');

// Login
router.post('/login', authLimiter, validateLogin, authController.login);

// Logout
router.post('/logout', authenticateToken, validateLogout, authController.logout);

// Refresh token
router.post('/refresh', validateRefreshToken, authController.refresh);

// Verify current password (quick check)
router.post('/verify-current', authenticateToken, validateVerifyCurrent, authController.verifyCurrentPassword);

// Change password (requires currentPassword, newPassword, confirmPassword)
router.post('/change-password', authenticateToken, validateChangePassword, authController.changePassword);

// Get current user's profile
router.get('/me', authenticateToken, authController.getProfile);

module.exports = router;
