import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';
import { config } from './env';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: config.logging.debug
      ? ['query', 'error', 'warn']
      : ['error', 'warn'],
  });

if (config.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Log database queries in development
if (config.logging.debug) {
  prisma.$on('query' as never, (e: any) => {
    logger.debug('Database query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Database connection closed');
});

export default prisma;

