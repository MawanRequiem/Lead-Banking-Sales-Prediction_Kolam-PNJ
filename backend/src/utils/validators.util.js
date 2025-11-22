/**
 * Validators Utility - Pure Functions
 * All validation logic extracted for reusability
 * No dependencies on Express - can be used anywhere
 */

const validator = require('validator');

/**
 * Validate UUID v4 format (Strict RFC 4122)
 */
function isValidUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') {return false;}

  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(uuid);
}

/**
 * Validate Email format (RFC 5322)
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') {return false;}

  return validator.isEmail(email, {
    allow_utf8_local_part: false,
    require_tld: true,
    allow_ip_domain: false,
  }) && email.length <= 255;
}

/**
 * Validate Phone Number (International E.164 format)
 * Indonesia: +62 followed by 8-12 digits
 */
function isValidPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {return true;} // Optional field

  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // E.164 format: +62 followed by 8-12 digits
  const phoneRegex = /^(\+62|62|0)[0-9]{8,12}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Validate Password Strength (NIST SP 800-63B + OWASP)
 * ✅ FIXED: No unnecessary regex escapes
 */
function validatePassword(password) {
  const errors = [];

  if (!password || typeof password !== 'string') {
    errors.push({
      field: 'password',
      message: 'Password is required',
      code: 'PASSWORD_REQUIRED',
    });
    return { valid: false, errors };
  }

  // Length requirements
  if (password.length < 12) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 12 characters long',
      code: 'PASSWORD_TOO_SHORT',
    });
  }

  if (password.length > 128) {
    errors.push({
      field: 'password',
      message: 'Password must not exceed 128 characters',
      code: 'PASSWORD_TOO_LONG',
    });
  }

  // Complexity requirements
  // ✅ FIXED: Cleaned regex (no unnecessary escapes)
  const requirements = [
    {
      regex: /[A-Z]/,
      message: 'at least one uppercase letter',
      code: 'NO_UPPERCASE',
    },
    {
      regex: /[a-z]/,
      message: 'at least one lowercase letter',
      code: 'NO_LOWERCASE',
    },
    {
      regex: /[0-9]/,
      message: 'at least one number',
      code: 'NO_NUMBER',
    },
    {
      // Only escape - (dash) and \ (backslash)
      regex: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      message: 'at least one special character',
      code: 'NO_SPECIAL_CHAR',
    },
  ];

  requirements.forEach(req => {
    if (!req.regex.test(password)) {
      errors.push({
        field: 'password',
        message: `Password must contain ${req.message}`,
        code: req.code,
      });
    }
  });

  // Check for common passwords
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty123', 'admin123',
    'letmein123', 'welcome123', 'passw0rd', 'admin@123',
  ];

  if (commonPasswords.some(common => password.toLowerCase() === common.toLowerCase())) {
    errors.push({
      field: 'password',
      message: 'This password is too common. Please choose a stronger password',
      code: 'PASSWORD_TOO_COMMON',
    });
  }

  // Check for repeated characters (aaa, 111, etc.)
  if (/(.)\1{2,}/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password should not contain repeated characters',
      code: 'PASSWORD_REPEATED_CHARS',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate Pagination Parameters
 */
function validatePagination(page, limit) {
  const errors = [];

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  // Page validation
  if (Number.isNaN(pageNum) || pageNum < 1 || pageNum > 10000) {
    errors.push({
      field: 'page',
      message: 'Page must be between 1 and 10000',
      code: 'INVALID_PAGE',
    });
  }

  // Limit validation (prevent resource exhaustion)
  if (Number.isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    errors.push({
      field: 'limit',
      message: 'Limit must be between 1 and 100',
      code: 'INVALID_LIMIT',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    page: Math.max(1, Math.min(pageNum, 10000)) || 1,
    limit: Math.max(1, Math.min(limitNum, 100)) || 10,
  };
}

/**
 * Validate string length
 */
function validateLength(value, fieldName, min = 1, max = 255) {
  const errors = [];

  if (!value || typeof value !== 'string') {
    errors.push({
      field: fieldName,
      message: `${fieldName} is required`,
      code: `${fieldName.toUpperCase()}_REQUIRED`,
    });
    return { valid: false, errors };
  }

  const trimmed = value.trim();

  if (trimmed.length < min) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be at least ${min} characters long`,
      code: `${fieldName.toUpperCase()}_TOO_SHORT`,
    });
  }

  if (trimmed.length > max) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must not exceed ${max} characters`,
      code: `${fieldName.toUpperCase()}_TOO_LONG`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  isValidUUID,
  isValidEmail,
  isValidPhoneNumber,
  validatePassword,
  validatePagination,
  validateLength,
};
