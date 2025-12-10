import { Request, Response, NextFunction } from 'express';
import authService from '@/services/auth.service';
import { ApiResponse } from '@/types';

class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await authService.register(req.body);
      
      const response: ApiResponse = {
        success: true,
        data,
        requestId: req.id,
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await authService.login(req.body);
      
      const response: ApiResponse = {
        success: true,
        data,
        requestId: req.id,
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Refresh token is required',
          },
          requestId: req.id,
        });
      }

      const data = await authService.refreshToken(refreshToken);
      
      const response: ApiResponse = {
        success: true,
        data,
        requestId: req.id,
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { refreshToken } = req.body;
      
      await authService.logout(userId, refreshToken);
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Logged out successfully' },
        requestId: req.id,
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

