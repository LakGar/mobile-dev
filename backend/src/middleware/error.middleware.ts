import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/errors';
import { logError } from '@/utils/logger';
import { config } from '@/config/env';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error with context
  logError(err, {
    requestId: (req as any).id,
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
    userId: (req as any).user?.id,
  });

  // Determine status code
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  
  // Don't expose internal errors in production
  const message = config.nodeEnv === 'production' && statusCode === 500
    ? 'Internal server error'
    : err.message;

  // Prepare error response
  const errorResponse: any = {
    success: false,
    error: {
      code: err.name || 'INTERNAL_ERROR',
      message,
    },
    requestId: (req as any).id,
  };

  // Include details if it's a ValidationError
  if (err instanceof AppError && 'details' in err && err.details) {
    errorResponse.error.details = err.details;
  }

  // Include stack trace in development
  if (config.nodeEnv === 'development' || config.logging.debug) {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// 404 handler for unknown routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(404, `Route ${req.method} ${req.path} not found`);
  next(error);
};

