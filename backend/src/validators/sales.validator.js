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
  nomor_telepon: Joi.string()
    .optional()
    .max(15)
    .messages({
      'string.max': 'Nomor telepon must be at most 15 characters long',
    }),
  domisili: Joi.string()
    .optional(),
});

module.exports = {
  createSalesSchema,
};
