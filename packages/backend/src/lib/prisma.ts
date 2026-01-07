import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// 优雅关闭
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
