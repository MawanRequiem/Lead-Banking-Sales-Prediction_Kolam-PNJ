/**
 * Sanitizers Utility - Input Sanitization
 * Prevents XSS, SQL Injection, and other attacks
 */

const validator = require('validator');

/**
 * Sanitize string input
 * ✅ FIXED: Proper escaping
 */
function sanitizeInput(input, options = {}) {
  const {
    maxLength = 255,
    allowedChars = null,
    stripHtml = true,
    toLowerCase = false,
    normalizeEmail = false,
  } = options;

  if (typeof input !== 'string') {return input;}

  let sanitized = input;

  // 1. Remove NULL bytes (bypass prevention)
  sanitized = sanitized.replace(/\0/g, '');

  // 2. Normalize unicode (prevent homograph attacks)
  sanitized = sanitized.normalize('NFKC');

  // 3. Strip HTML/Script tags if enabled
  if (stripHtml) {
    sanitized = validator.stripLow(sanitized);
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = validator.escape(sanitized);
  }

  // 4. Trim whitespace
  sanitized = sanitized.trim();

  // 5. Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // 6. Whitelist allowed characters if specified
  if (allowedChars) {
    const regex = new RegExp(`[^${allowedChars}]`, 'g');
    sanitized = sanitized.replace(regex, '');
  }

  // 7. Convert to lowercase if needed
  if (toLowerCase) {
    sanitized = sanitized.toLowerCase();
  }

  // 8. Normalize email if needed
  if (normalizeEmail && validator.isEmail(sanitized)) {
    sanitized = validator.normalizeEmail(sanitized, {
      all_lowercase: true,
      gmail_remove_dots: false,
    });
  }

  return sanitized;
}

function maskPII(data, type = 'default') {
  if (!data || typeof data !== 'string') {return data;}

  // Declare variables at function scope
  let localPart, domain, parts;

  switch (type) {
    case 'email':
      // user@example.com -> u***@example.com
      [localPart, domain] = data.split('@');
      return `${localPart.charAt(0)}***@${domain}`;

    case 'phone':
      // +6281234567890 -> +628***7890
      return `${data.slice(0, 5)}***${data.slice(-4)}`;

    case 'name':
      // John Doe -> J*** D***
      parts = data.split(' ');
      return parts.map(part => `${part.charAt(0)}***`).join(' ');

    case 'id':
      // UUID: 123e4567-e89b-... -> 123e***4000
      return `${data.slice(0, 4)}***${data.slice(-4)}`;

    default:
      // Default: show first and last 4 chars
      if (data.length <= 8) {return '***';}
      return `${data.slice(0, 4)}***${data.slice(-4)}`;
  }
}

module.exports = {
  sanitizeInput,
  maskPII,
};
