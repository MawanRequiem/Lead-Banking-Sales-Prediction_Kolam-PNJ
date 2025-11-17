const Joi = require('joi');

const createSalesSchema = Joi.object({
  nama: Joi.string()
    .required()
    .messages({
      'any.required': 'Nama is required',
    }),
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
  nomorTelepon: Joi.string()
    .optional()
    .allow(null, '')
    .max(15)
    .messages({
      'string.max': 'Nomor telepon must be at most 15 characters long',
    }),
  domisili: Joi.string()
    .optional()
    .allow(null, ''),
});

const updateSalesSchema = Joi.object({
  nama: Joi.string().optional(),
  email: Joi.string().email().optional().messages({
    'string.email': 'Email must be a valid email address',
  }),
  nomorTelepon: Joi.string()
    .optional()
    .allow(null, '')
    .max(15)
    .messages({
      'string.max': 'Nomor telepon must be at most 15 characters long',
    }),
  domisili: Joi.string().optional().allow(null, ''),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

const resetPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'any.required': 'New password is required',
    }),
});

module.exports = {
  createSalesSchema,
  updateSalesSchema,
  resetPasswordSchema,
};
