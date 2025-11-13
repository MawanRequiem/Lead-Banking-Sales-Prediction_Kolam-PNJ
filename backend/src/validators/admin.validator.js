const Joi = require('joi');

/**
 * Admin Validation Schemas
 */

const createAdminSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required',
    }),

  emailRecovery: Joi.string()
    .email()
    .optional()
    .allow(null, '')
    .messages({
      'string.email': 'Recovery email must be a valid email address',
    }),
});

module.exports = {
  createAdminSchema,
};
