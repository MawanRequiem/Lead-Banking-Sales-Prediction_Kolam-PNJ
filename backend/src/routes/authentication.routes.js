const express = require('express');
const router = express.Router();
const authController = require('../controllers/authentication.controller');
const { authenticateToken, optionalAuth } = require('../middlewares/auth.middleware');
const { validateLogin, validateRefreshToken, validateLogout, validateVerifyCurrent, validateChangePassword } = require('../middlewares/validation.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');

// Login
router.post('/login', authLimiter, validateLogin, authController.login);

// Logout
// Use optionalAuth so logout still succeeds when access token expired; refresh token
// will be read from body or cookie by validation/controller.
router.post('/logout', optionalAuth, validateLogout, authController.logout);

// Refresh token
router.post('/refresh', validateRefreshToken, authController.refresh);

// Verify current password (quick check)
router.post('/verify-current', authenticateToken, validateVerifyCurrent, authController.verifyCurrentPassword);

// Change password (requires currentPassword, newPassword, confirmPassword)
router.post('/change-password', authenticateToken, validateChangePassword, authController.changePassword);

// Get current user's profile
router.get('/me', authenticateToken, authController.getProfile);

module.exports = router;
