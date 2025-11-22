/**
 * Security Configuration
 * Standards: OWASP Secure Headers Project, CSP Level 3
 */

const helmet = require('helmet');
const cors = require('cors');

/**
 * Helmet Configuration (Security Headers)
 */
const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },

  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false,
  },

  // Expect-CT (Certificate Transparency)
  expectCt: {
    maxAge: 86400,
    enforce: true,
  },

  // Frameguard (X-Frame-Options)
  frameguard: {
    action: 'deny',
  },

  // Hide Powered By
  hidePoweredBy: true,

  // HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // IE No Open
  ieNoOpen: true,

  // No Sniff (X-Content-Type-Options)
  noSniff: true,

  // Permissions Policy
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none',
  },

  // Referrer Policy
  referrerPolicy: {
    policy: 'no-referrer',
  },

  // XSS Filter
  xssFilter: true,
});

/**
 * CORS Configuration (Cross-Origin Resource Sharing)
 */
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {return callback(null, true);}

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-ID',
    'X-Correlation-ID',
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-Correlation-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'Retry-After',
  ],
  maxAge: 86400, // 24 hours
});

module.exports = {
  helmetConfig,
  corsConfig,
};
