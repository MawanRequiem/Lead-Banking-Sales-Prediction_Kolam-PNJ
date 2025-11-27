const crypto = require('crypto');
const { createVerification, findValidByToken, markUsed } = require('../repositories/passwordVerification.repository');
const logger = require('../config/logger');

async function generateVerificationTokenForUser(userId, ttlMinutes = 5) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  try {
    const rec = await createVerification({ token, userId, expiresAt });
    return rec;
  } catch (error) {
    logger.error('Failed to generate verification token', error);
    throw error;
  }
}

async function validateAndConsumeToken(token, userId) {
  const rec = await findValidByToken(token);
  if (!rec) {return null;}
  // optional: ensure token belongs to user
  if (rec.idUser !== userId) {return null;}
  await markUsed(rec.id);
  return rec;
}

module.exports = {
  generateVerificationTokenForUser,
  validateAndConsumeToken,
};
