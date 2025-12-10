import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@/utils/errors';

/**
 * Validate request body against Zod schema
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          details[path] = err.message;
        });
        throw new ValidationError('Validation failed', details);
      }
      next(error);
    }
  };
};

/**
 * Validate request query parameters
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          details[path] = err.message;
        });
        throw new ValidationError('Query validation failed', details);
      }
      next(error);
    }
  };
};

/**
 * Validate request parameters
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          details[path] = err.message;
        });
        throw new ValidationError('Parameter validation failed', details);
      }
      next(error);
    }
  };
};

