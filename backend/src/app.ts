import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@/config/env';
import { requestIdMiddleware } from '@/middleware/request-id.middleware';
import { requestLogger } from '@/utils/logger';
import { errorHandler, notFoundHandler } from '@/middleware/error.middleware';
import healthRoutes from '@/routes/health.routes';
import { logger } from '@/utils/logger';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID middleware (must be before request logger)
app.use(requestIdMiddleware);

// Request logging middleware
app.use(requestLogger);

// Health check routes (before auth)
app.use('/api', healthRoutes);

// API routes
import authRoutes from '@/routes/auth.routes';
import userRoutes from '@/routes/user.routes';
import zoneRoutes from '@/routes/zone.routes';
import activityRoutes from '@/routes/activity.routes';
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/activities', activityRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`, {
    environment: config.nodeEnv,
    port: PORT,
  });
});

export default app;

