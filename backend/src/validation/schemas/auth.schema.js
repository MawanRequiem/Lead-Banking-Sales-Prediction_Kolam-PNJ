/**
 * Authentication Validation Schemas
 * Login, logout, token refresh validation
 */

const Joi = require('joi');

/**
 * Login Schema
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: true } })
    .max(255)
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email format is invalid',
      'string.max': 'Email must not exceed 255 characters',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(1)
    .max(128)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.max': 'Password must not exceed 128 characters',
      'any.required': 'Password is required',
    }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

/**
 * Refresh Token Schema
 */
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.empty': 'Refresh token is required',
      'any.required': 'Refresh token is required',
    }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

/**
 * Logout Schema
 */
const logoutSchema = Joi.object({
  refreshToken: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.empty': 'Refresh token is required',
      'any.required': 'Refresh token is required',
    }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

/**
 * Change Password Schema
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .min(1)
    .max(128)
    .required()
    .messages({
      'string.empty': 'Current password is required',
      'any.required': 'Current password is required',
    }),

  newPassword: Joi.string()
    .min(12)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/)
    .invalid(Joi.ref('currentPassword'))
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 12 characters long',
      'string.max': 'New password must not exceed 128 characters',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.invalid': 'New password must be different from current password',
      'any.required': 'New password is required',
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Confirm password must match new password',
      'any.required': 'Confirm password is required',
    }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

module.exports = {
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
  changePasswordSchema,
};
