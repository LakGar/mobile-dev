import activityRepository from '@/repositories/activity.repository';
import zoneRepository from '@/repositories/zone.repository';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export interface CreateActivityData {
  zoneId: string;
  type: 'enter' | 'exit';
}

export interface ActivityFilters {
  zoneId?: string;
  type?: 'enter' | 'exit';
  sortBy?: 'recent' | 'oldest' | 'zone';
  limit?: number;
  offset?: number;
}

class ActivityService {
  /**
   * Create a new activity
   */
  async createActivity(userId: string, data: CreateActivityData) {
    const startTime = Date.now();

    // Verify zone exists and belongs to user
    const zone = await zoneRepository.findById(data.zoneId);
    if (!zone || zone.deletedAt) {
      throw new NotFoundError('Zone');
    }
    if (zone.userId !== userId) {
      throw new ValidationError('Zone does not belong to user');
    }

    // Validate type
    if (data.type !== 'enter' && data.type !== 'exit') {
      throw new ValidationError('Type must be "enter" or "exit"');
    }

    const activity = await activityRepository.create({
      userId,
      zoneId: data.zoneId,
      zoneName: zone.title,
      type: data.type,
      icon: zone.icon,
    });

    logger.info('Activity created', {
      activityId: activity.id,
      userId,
      zoneId: data.zoneId,
      type: data.type,
      duration: Date.now() - startTime,
    });

    return this.formatActivity(activity);
  }

  /**
   * Get activities for user
   */
  async getActivities(userId: string, filters: ActivityFilters) {
    const startTime = Date.now();

    const result = await activityRepository.findMany({
      userId,
      ...filters,
    });

    logger.info('Activities retrieved', {
      userId,
      count: result.activities.length,
      duration: Date.now() - startTime,
    });

    return {
      activities: result.activities.map(activity => this.formatActivity(activity)),
      total: result.total,
    };
  }

  /**
   * Get activity statistics
   */
  async getStatistics(userId: string, zoneId?: string) {
    const startTime = Date.now();

    // Verify zone if provided
    if (zoneId) {
      const zone = await zoneRepository.findById(zoneId);
      if (!zone || zone.deletedAt) {
        throw new NotFoundError('Zone');
      }
      if (zone.userId !== userId) {
        throw new ValidationError('Zone does not belong to user');
      }
    }

    const stats = await activityRepository.getStatistics(userId, zoneId);

    logger.info('Statistics retrieved', {
      userId,
      zoneId,
      duration: Date.now() - startTime,
    });

    return stats;
  }

  /**
   * Format activity for response
   */
  private formatActivity(activity: any) {
    const timestamp = Number(activity.timestamp);
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let time: string;
    if (days > 0) {
      time = `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      time = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      time = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      time = 'Just now';
    }

    return {
      id: activity.id,
      zoneId: activity.zoneId,
      zoneName: activity.zoneName,
      type: activity.type,
      time,
      timestamp,
      icon: activity.icon,
      createdAt: activity.createdAt.toISOString(),
    };
  }
}

export default new ActivityService();

