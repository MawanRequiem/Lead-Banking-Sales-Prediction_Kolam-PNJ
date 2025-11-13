const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

function setupGracefulShutdown() {
  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

  signals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`\n${signal} received, closing database connection...`);
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}

module.exports = {
  prisma,
  connectDatabase,
  setupGracefulShutdown,
};
