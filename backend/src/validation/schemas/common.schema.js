/**
 * Common Reusable Validation Schemas
 * Shared validators used across different schemas
 */

const Joi = require('joi');

/**
 * UUID v4 Schema
 */
const uuidSchema = Joi.string()
  .uuid({ version: 'uuidv4' })
  .messages({
    'string.guid': 'Invalid UUID format',
  });

/**
 * Email Schema
 */
const emailSchema = Joi.string()
  .email({ tlds: { allow: true } })
  .max(255)
  .trim()
  .lowercase()
  .messages({
    'string.email': 'Email format is invalid',
    'string.max': 'Email must not exceed 255 characters',
  });

/**
 * Password Schema (Strong)
 */
const strongPasswordSchema = Joi.string()
  .min(12)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/)
  .messages({
    'string.min': 'Password must be at least 12 characters long',
    'string.max': 'Password must not exceed 128 characters',
    'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
  });

/**
 * Phone Number Schema (Indonesia)
 */
const phoneNumberSchema = Joi.string()
  .trim()
  .pattern(/^(\+62|62|0)[0-9]{8,12}$/)
  .max(20)
  .messages({
    'string.pattern.base': 'Phone number format is invalid. Use format: +6281234567890 or 081234567890',
    'string.max': 'Phone number must not exceed 20 characters',
  });

/**
 * Name Schema
 */
const nameSchema = Joi.string()
  .min(2)
  .max(255)
  .trim()
  .pattern(/^[a-zA-Z\s'-]+$/)
  .messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 255 characters',
    'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes',
  });

/**
 * Pagination Schema
 */
const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
});

/**
 * Sort Schema
 */
const sortSchema = Joi.object({
  sortBy: Joi.string()
    .default('createdAt'),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc'),
});

/**
 * Date Range Schema
 */
const dateRangeSchema = Joi.object({
  startDate: Joi.date()
    .iso()
    .messages({
      'date.base': 'Start date must be a valid date',
      'date.format': 'Start date must be in ISO format',
    }),

  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .messages({
      'date.base': 'End date must be a valid date',
      'date.format': 'End date must be in ISO format',
      'date.min': 'End date must be after start date',
    }),
});

/**
 * ID Parameter Schema
 */
const idParamSchema = Joi.object({
  id: uuidSchema.required(),
});

module.exports = {
  uuidSchema,
  emailSchema,
  strongPasswordSchema,
  phoneNumberSchema,
  nameSchema,
  paginationSchema,
  sortSchema,
  dateRangeSchema,
  idParamSchema,
};
