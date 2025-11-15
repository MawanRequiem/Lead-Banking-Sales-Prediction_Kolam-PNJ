const authenticationService = require('../services/authentication.service');
const { successResponse, errorResponse } = require('../utils/response.util');
const { generateToken } = require('../utils/token.util');
const logger = require('../config/logger');

async function login(req, res) {
  try {
    const userData = req.body;

    const authenticators = [
      authenticationService.authenticateAdmin,
      authenticationService.authenticateSales,
    ];

    let user = null;

    for (const authFn of authenticators) {
      user = await authFn(userData);
      if (user) { break; }
    }

    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Generate tokens
    const accessToken = generateToken(user);
    const refreshToken = await authenticationService.createRefreshToken();

    // Response payload yang jelas
    const responsePayload = {
      user: {
        id: user.id,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };

    logger.info(`User logged in: ${user.id} (${user.role})`);

    return successResponse(res, responsePayload, 'Login successful');
  } catch (error) {
    logger.error('Error in login:', error);
    return errorResponse(res, 'Failed to login', 500);
  }
}

module.exports = {
  login,
};
