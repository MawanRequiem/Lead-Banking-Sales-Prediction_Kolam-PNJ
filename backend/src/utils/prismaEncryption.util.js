const { encrypt, decrypt } = require('./encryption.util');

/**
 * Encrypt sensitive fields before saving
 */
function encryptSensitiveFields(data) {
  if (!data) {return data;}

  const encrypted = { ...data };

  // Encrypt sensitive fields
  if (encrypted.nomorTelepon) {
    encrypted.nomorTelepon = encrypt(encrypted.nomorTelepon);
  }

  if (encrypted.domisili) {
    encrypted.domisili = encrypt(encrypted.domisili);
  }

  return encrypted;
}

/**
 * Decrypt sensitive fields after reading
 */
function decryptSensitiveFields(data) {
  if (!data) {return data;}

  const decrypted = { ...data };

  // Decrypt sensitive fields
  if (decrypted.nomorTelepon) {
    try {
      decrypted.nomorTelepon = decrypt(decrypted.nomorTelepon);
    } catch (error) {
      // If decryption fails, field might not be encrypted
      // Keep original value
    }
  }

  if (decrypted.domisili) {
    try {
      decrypted.domisili = decrypt(decrypted.domisili);
    } catch (error) {
      // Keep original value
    }
  }

  return decrypted;
}

module.exports = {
  encryptSensitiveFields,
  decryptSensitiveFields,
};
