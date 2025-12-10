import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt';
import { UnauthorizedError } from '@/utils/errors';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = verifyAccessToken(token);

    // Attach user to request
    req.user = {
      id: payload.userId,
      email: payload.email,
      username: payload.username,
    };

    next();
  } catch (error: any) {
    if (error.message.includes('expired')) {
      throw new UnauthorizedError('Token expired');
    }
    throw new UnauthorizedError('Invalid token');
  }
};

