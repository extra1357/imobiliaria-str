import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function main() {
  console.log('Testing database connection...');
  await prisma.$connect();
  console.log('DATABASE OK');
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('DATABASE ERROR:', error);
  process.exit(1);
});

