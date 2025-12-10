import { Request, Response, NextFunction } from 'express';
import userService from '@/services/user.service';
import { ApiResponse } from '@/types';

class UserController {
  /**
   * Get current user profile
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await userService.getUserById(userId);
      
      const response: ApiResponse = {
        success: true,
        data: user,
        requestId: req.id,
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update current user profile
   */
  async updateCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await userService.updateUser(userId, req.body);
      
      const response: ApiResponse = {
        success: true,
        data: user,
        requestId: req.id,
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await userService.changePassword(userId, req.body);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        requestId: req.id,
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();

