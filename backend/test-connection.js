const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const data = await prisma.jenisKelamin.findMany();
    console.log(' Connected! Data:', data);
  } catch (error) {
    console.error(' Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
