const Jwt = require('jsonwebtoken');
const { config } = require('../config/env');

function generateToken(payload, options = {}) {
  return Jwt.sign(payload, config.token.secret, { ...options, expiresIn: config.token.expiresIn });
}
function verifyToken(token) {
  try {
    return Jwt.verify(token, config.token.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { expired: true };
    }
    return null; // invalid signature, malformed token, etc.
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
