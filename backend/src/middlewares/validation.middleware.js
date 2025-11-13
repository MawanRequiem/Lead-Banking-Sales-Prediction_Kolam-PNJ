const { validationErrorResponse } = require('../utils/response.util');
const logger = require('../config/logger');

/**
 * Validation Middleware
 * Validates request body against Joi schema
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      logger.warn('Validation error:', error.details);
      return validationErrorResponse(res, error.details);
    }

    // Replace req.body with validated & sanitized data
    req.body = value;
    next();
  };
}

module.exports = {
  validate,
};
