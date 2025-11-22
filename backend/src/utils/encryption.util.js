/**
 * Data Encryption & PII Protection
 * Standards: AES-256-GCM, NIST FIPS 140-2, GDPR Article 32
 * Purpose: Encrypt sensitive data at rest and in transit
 */

const crypto = require('crypto');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;

/**
 * Derive encryption key from secret
 * Uses PBKDF2 with SHA-512
 */
function deriveKey(secret, salt) {
  return crypto.pbkdf2Sync(
    secret,
    salt,
    100000, // iterations
    KEY_LENGTH,
    'sha512',
  );
}

/**
 * Encrypt data with AES-256-GCM
 * Returns: encrypted:iv:authTag:salt (base64 encoded)
 */
function encrypt(plaintext, secret = process.env.ENCRYPTION_KEY) {
  if (!plaintext) {return null;}

  try {
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derive key from secret
    const key = deriveKey(secret, salt);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Combine all components
    return [
      encrypted,
      iv.toString('base64'),
      authTag.toString('base64'),
      salt.toString('base64'),
    ].join(':');
  } catch (error) {
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt data with AES-256-GCM
 */
function decrypt(encryptedData, secret = process.env.ENCRYPTION_KEY) {
  if (!encryptedData) {return null;}

  try {
    // Split components
    const [encrypted, ivBase64, authTagBase64, saltBase64] = encryptedData.split(':');

    if (!encrypted || !ivBase64 || !authTagBase64 || !saltBase64) {
      throw new Error('Invalid encrypted data format');
    }

    // Decode base64
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    const salt = Buffer.from(saltBase64, 'base64');

    // Derive key
    const key = deriveKey(secret, salt);

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed');
  }
}

/**
 * Hash data with SHA-256 (one-way)
 * For data that doesn't need to be decrypted (like tokens)
 */
function hash(data) {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

/**
 * Generate cryptographic random string
 */
function generateRandomString(length = 32) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

/**
 * Mask PII data for display/logging
 */
function maskPII(data, type = 'default') {
  if (!data || typeof data !== 'string') {return data;}
  switch (type) {
    case 'email': {
      const [localPart, domain] = data.split('@');
      return `${localPart.charAt(0)}***@${domain}`;
    }
    case 'phone': {
      return `${data.slice(0, 5)}***${data.slice(-4)}`;
    }
    case 'name': {
      const parts = data.split(' ');
      return parts.map(part => `${part.charAt(0)}***`).join(' ');
    }
    case 'id': {
      return `${data.slice(0, 4)}***${data.slice(-4)}`;
    }
    default: {
      if (data.length <= 8) {return '***';}
      return `${data.slice(0, 4)}***${data.slice(-4)}`;
    }
  }
}

/**
 * Tokenize sensitive data
 * Replace actual value with a token, store mapping securely
 */
function tokenize(data) {
  const token = `tok_${generateRandomString(32)}`;
  const encryptedData = encrypt(data);

  return {
    token,
    encryptedData,
  };
}

/**
 * Detokenize
 */
function detokenize(encryptedData) {
  return decrypt(encryptedData);
}

/**
 * Validate encryption configuration
 */
function validateEncryptionConfig() {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }

  if (process.env.ENCRYPTION_KEY.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
  }
}

module.exports = {
  encrypt,
  decrypt,
  hash,
  generateRandomString,
  maskPII,
  tokenize,
  detokenize,
  validateEncryptionConfig,
};
