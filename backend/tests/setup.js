// Load environment variables for testing
require('dotenv').config({ path: '.env' });

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

const { prisma } = require('../src/config/prisma');

// Setup global test hooks
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

afterAll(async () => {
  // Cleanup and disconnect
  await prisma.$disconnect();

  // Close Redis connections only if redis config exists
  try {
    const { redis } = require('../src/config/redis');
    if (redis && redis.quit) {
      await redis.quit();
    }
  } catch (error) {
    // Redis config might not exist, skip
    console.log('Redis config not found, skipping cleanup');
  }
});

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
