const authenticationService = require('../services/authentication.service');
const { successResponse, errorResponse } = require('../utils/response.util');
const { generateToken } = require('../utils/token.util');

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

    const accessToken = generateToken(user);
    const refreshToken = await authenticationService.createRefreshToken();
    const responsePayload = {
      ...user,
      accessToken,
      refreshToken,
    };

    return successResponse(res, responsePayload, 'Login successful');
  } catch (error) {
    return errorResponse(res, 'Failed to login', 500);
  }
}

module.exports = {
  login,
};
