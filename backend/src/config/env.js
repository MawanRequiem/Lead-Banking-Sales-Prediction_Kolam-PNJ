require('dotenv').config();

const config = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    name: process.env.APP_NAME || 'Telesales API',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  token: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY,
  },
};

function validateEnv() {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_ACCESS_TOKEN_EXPIRY'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  config,
  validateEnv,
};
