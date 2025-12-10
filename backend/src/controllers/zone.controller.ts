import { Request, Response, NextFunction } from 'express';
import zoneService from '@/services/zone.service';
import { ApiResponse, PaginatedResponse } from '@/types';

class ZoneController {
  /**
   * Get all zones for authenticated user
   */
  async getZones(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const filters = {
        icon: req.query.filter as string | undefined,
        sortBy: (req.query.sort as 'name' | 'date' | 'radius') || 'date',
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
      };

      const result = await zoneService.getZones(userId, filters);
      
      const response: PaginatedResponse = {
        success: true,
        data: result.zones,
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
   * Get zone by ID
   */
  async getZone(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const zoneId = req.params.id;
      const zone = await zoneService.getZoneById(zoneId, userId);
      
      const response: ApiResponse = {
        success: true,
        data: zone,
        requestId: req.id,
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new zone
   */
  async createZone(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const zone = await zoneService.createZone(userId, req.body);
      
      const response: ApiResponse = {
        success: true,
        data: zone,
        requestId: req.id,
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update zone
   */
  async updateZone(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const zoneId = req.params.id;
      const zone = await zoneService.updateZone(zoneId, userId, req.body);
      
      const response: ApiResponse = {
        success: true,
        data: zone,
        requestId: req.id,
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete zone
   */
  async deleteZone(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const zoneId = req.params.id;
      const result = await zoneService.deleteZone(zoneId, userId);
      
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

export default new ZoneController();

