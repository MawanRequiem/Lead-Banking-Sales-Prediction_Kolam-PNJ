const Joi = require('joi');

/**
 * Create Sales Schema
 * All validations for creating a new sales account
 */
const createSalesSchema = Joi.object({
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
      'string.max': 'Email must not exceed 255 characters',
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
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),

  nomorTelepon: Joi.string()
    .trim()
    .pattern(/^(\+62|62|0)[0-9]{8,12}$/)
    .max(20)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Phone number format is invalid. Use format: +6281234567890 or 081234567890',
      'string.max': 'Phone number must not exceed 20 characters',
    }),

  domisili: Joi.string()
    .trim()
    .max(255)
    .allow(null, '')
    .messages({
      'string.max': 'Domicile must not exceed 255 characters',
    }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

/**
 * Update Sales Schema
 * Partial update - at least one field required
 */
const updateSalesSchema = Joi.object({
  nama: Joi.string()
    .min(2)
    .max(255)
    .trim()
    .pattern(/^[a-zA-Z\s'-]+$/)
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 255 characters',
      'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes',
    }),

  nomorTelepon: Joi.string()
    .trim()
    .pattern(/^(\+62|62|0)[0-9]{8,12}$/)
    .max(20)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Phone number format is invalid',
      'string.max': 'Phone number must not exceed 20 characters',
    }),

  domisili: Joi.string()
    .trim()
    .max(255)
    .allow(null, '')
    .messages({
      'string.max': 'Domicile must not exceed 255 characters',
    }),
})
  .min(1) // At least one field must be provided
  .messages({
    'object.min': 'At least one field must be provided for update',
  })
  .options({
    abortEarly: false,
    stripUnknown: true,
  });

/**
 * Reset Password Schema
 */
const resetPasswordSchema = Joi.object({
  newPassword: Joi.string()
    .min(12)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/)
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'Password must be at least 12 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required',
    }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

/**
 * Query Parameters Schema for GET /sales
 */
const salesQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1',
      'number.max': 'Page must not exceed 10000',
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100',
    }),

  isActive: Joi.boolean()
    .messages({
      'boolean.base': 'isActive must be true or false',
    }),

  search: Joi.string()
    .trim()
    .max(100)
    .allow('')
    .messages({
      'string.max': 'Search query must not exceed 100 characters',
    }),

  sortBy: Joi.string()
    .valid('nama', 'email', 'createdAt', 'updatedAt')
    .default('createdAt')
    .messages({
      'any.only': 'sortBy must be one of: nama, email, createdAt, updatedAt',
    }),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'sortOrder must be either asc or desc',
    }),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const logCallSchema = Joi.object({
  nasabahId: Joi.string()
    .uuid({ version: 'uuidv4' })
    .required()
    .messages({
      'string.guid': 'Invalid Nasabah ID format',
      'any.required': 'Nasabah ID is required',
    }),

  nomorTelepon: Joi.string()
    .trim()
    .pattern(/^(\+62|62|0)[0-9]{8,12}$/)
    .max(20)
    .required()
    .messages({
      'string.pattern.base': 'Phone number format is invalid',
      'any.required': 'Phone number is required',
    }),

  lamaTelepon: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.base': 'Duration must be a number (seconds)',
      'any.required': 'Call duration is required',
    }),

  hasilTelepon: Joi.string()
    .max(255)
    .required()
    .messages({
      'any.required': 'Call result is required',
    }),

  catatan: Joi.string()
    .allow(null, '')
    .max(1000)
    .messages({
      'string.max': 'Note is too long (max 1000 chars)',
    }),

  nextFollowupDate: Joi.date()
    .iso()
    //.min('now') // Opsional: Aktifkan jika tidak boleh tanggal mundur
    .allow(null)
    .messages({
      'date.format': 'Invalid date format (ISO required)',
    }),

  updateStatusDeposito: Joi.boolean()
    .default(false),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const updateStatusSchema = Joi.object({
  nasabahId: Joi.string()
    .uuid({ version: 'uuidv4' })
    .required(),

  status: Joi.string()
    .valid('PROSPEK', 'DIHUBUNGI', 'TERTARIK', 'TIDAK_TERTARIK', 'AKTIF', 'JATUH_TEMPO', 'DICAIRKAN')
    .required(),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

module.exports = {
  createSalesSchema,
  updateSalesSchema,
  resetPasswordSchema,
  salesQuerySchema,
  logCallSchema,
  updateStatusSchema,
};
