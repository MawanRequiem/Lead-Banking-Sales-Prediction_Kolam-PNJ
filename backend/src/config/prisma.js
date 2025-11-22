const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

/**
 * Connect to Database
 */
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    return prisma;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

/**
 * Disconnect from Database
 */
async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected');
  } catch (error) {
    console.error('Database disconnect failed:', error);
  }
}

/**
 * Setup Graceful Shutdown
 */
function setupGracefulShutdown() {
  const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received, closing database connection...`);
    await disconnectDatabase();
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('beforeExit', disconnectDatabase);
}

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase,
  setupGracefulShutdown,
};
