module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Coverage
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/app.js', // Main entry point
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Test patterns
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
  ],

  // Setup
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Mocks
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Timeout
  testTimeout: 10000,

  // Global variables
  globals: {
    'NODE_ENV': 'test',
  },

  // Transform
  transform: {},

  // Module paths
  moduleDirectories: ['node_modules', 'src'],
  // Verbose
  verbose: true,
  // Detect open handles
  detectOpenHandles: true,
  forceExit: true,
};
