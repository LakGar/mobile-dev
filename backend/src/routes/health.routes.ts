import { Router, Request, Response } from 'express';
import { config } from '@/config/env';

const router = Router();

// Simple health check
router.get('/health', async (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
  };

  res.status(200).json(health);
});

// Detailed health check with service dependencies
router.get('/health/detailed', async (req: Request, res: Response) => {
  const checks: Record<string, { status: string; message?: string }> = {
    database: await checkDatabase(),
    // Add more checks as services are implemented
    // redis: await checkRedis(),
    // storage: await checkStorage(),
  };

  const isHealthy = Object.values(checks).every(check => check.status === 'ok');
  const statusCode = isHealthy ? 200 : 503;

  const health = {
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
    checks,
  };

  res.status(statusCode).json(health);
});

// Database health check
async function checkDatabase(): Promise<{ status: string; message?: string }> {
  try {
    const prisma = (await import('@/config/database')).default;
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message || 'Database connection failed',
    };
  }
}

export default router;

