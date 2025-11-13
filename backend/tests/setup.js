// Load environment variables for testing
require('dotenv').config({ path: '.env.test' });

// Global test timeout
jest.setTimeout(10000);

// Mock logger to reduce noise in tests
jest.mock('../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  stream: {
    write: jest.fn(),
  },
}));

// Global teardown
afterAll(async () => {
  // Close database connections
  const { prisma } = require('../src/config/prisma');
  await prisma.$disconnect();

  // Close Redis connections
  const { redis } = require('../src/config/redis');
  await redis.quit();
});
