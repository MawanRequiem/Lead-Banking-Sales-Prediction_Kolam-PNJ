/**
 * Admin-specific Validation Schemas
 */

const Joi = require('joi');

/**
 * Create Admin Schema
 */
const createAdminSchema = Joi.object({
  nama: Joi.string()
    .min(2)
    .max(255)
    .trim()
    .pattern(/^[a-zA-Z\s'-]+$/)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 255 characters',
      'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes',
      'any.required': 'Name is required',
    }),

  email: Joi.string()
    .email({ tlds: { allow: true } })
    .max(255)
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email format is invalid',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(12)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 12 characters long',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
      'any.required': 'Password is required',
    }),

  role: Joi.string()
    .valid('superadmin', 'admin')
    .default('admin')
    .messages({
      'any.only': 'Role must be either superadmin or admin',
    }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

/**
 * Update Admin Schema
 */
const updateAdminSchema = Joi.object({
  nama: Joi.string()
    .min(2)
    .max(255)
    .trim()
    .pattern(/^[a-zA-Z\s'-]+$/),

  role: Joi.string()
    .valid('superadmin', 'admin'),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided',
  })
  .options({
    abortEarly: false,
    stripUnknown: true,
  });

module.exports = {
  createAdminSchema,
  updateAdminSchema,
};
