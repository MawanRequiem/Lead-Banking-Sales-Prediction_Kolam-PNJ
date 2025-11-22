const express = require('express');
const router = express.Router();
const authController = require('../controllers/authentication.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { validateLogin, validateRefreshToken, validateLogout } = require('../middlewares/validation.middleware');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');

// Login
router.post('/login', authLimiter, validateLogin, authController.login);

// Logout
router.post('/logout', authenticateToken, validateLogout, authController.logout);

// Refresh token
router.post('/refresh', validateRefreshToken, authController.refresh);

module.exports = router;
