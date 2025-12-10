import { Request, Response, NextFunction } from 'express';
import activityService from '@/services/activity.service';
import { ApiResponse, PaginatedResponse } from '@/types';

class ActivityController {
  /**
   * Get activities for authenticated user
   */
  async getActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const filters = {
        zoneId: req.query.zoneId as string | undefined,
        type: req.query.type as 'enter' | 'exit' | undefined,
        sortBy: (req.query.sort as 'recent' | 'oldest' | 'zone') || 'recent',
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
      };

      const result = await activityService.getActivities(userId, filters);
      
      const response: PaginatedResponse = {
        success: true,
        data: result.activities,
        meta: {
          page: Math.floor((filters.offset || 0) / (filters.limit || 100)) + 1,
          limit: filters.limit || 100,
          total: result.total,
          totalPages: Math.ceil(result.total / (filters.limit || 100)),
        },
        requestId: req.id,
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new activity
   */
  async createActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const activity = await activityService.createActivity(userId, req.body);
      
      const response: ApiResponse = {
        success: true,
        data: activity,
        requestId: req.id,
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get activity statistics
   */
  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const zoneId = req.query.zoneId as string | undefined;
      const stats = await activityService.getStatistics(userId, zoneId);
      
      const response: ApiResponse = {
        success: true,
        data: stats,
        requestId: req.id,
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new ActivityController();

