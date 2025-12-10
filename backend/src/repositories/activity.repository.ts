import prisma from '@/config/database';
import { Activity, Prisma } from '@prisma/client';

export interface CreateActivityData {
  userId: string;
  zoneId: string;
  zoneName: string;
  type: 'enter' | 'exit';
  icon: string;
}

export interface ActivityFilters {
  userId: string;
  zoneId?: string;
  type?: 'enter' | 'exit';
  sortBy?: 'recent' | 'oldest' | 'zone';
  limit?: number;
  offset?: number;
}

class ActivityRepository {
  /**
   * Create a new activity
   */
  async create(data: CreateActivityData): Promise<Activity> {
    return prisma.activity.create({
      data: {
        userId: data.userId,
        zoneId: data.zoneId,
        zoneName: data.zoneName,
        type: data.type,
        timestamp: BigInt(Date.now()),
        icon: data.icon,
      },
    });
  }

  /**
   * Find activities with filters
   */
  async findMany(filters: ActivityFilters): Promise<{ activities: Activity[]; total: number }> {
    const where: Prisma.ActivityWhereInput = {
      userId: filters.userId,
    };

    if (filters.zoneId) {
      where.zoneId = filters.zoneId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    let orderBy: Prisma.ActivityOrderByWithRelationInput = {};
    switch (filters.sortBy) {
      case 'oldest':
        orderBy = { timestamp: 'asc' };
        break;
      case 'zone':
        orderBy = { zoneName: 'asc' };
        break;
      case 'recent':
      default:
        orderBy = { timestamp: 'desc' };
        break;
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy,
        take: filters.limit || 100,
        skip: filters.offset || 0,
      }),
      prisma.activity.count({ where }),
    ]);

    return { activities, total };
  }

  /**
   * Get activity statistics
   */
  async getStatistics(userId: string, zoneId?: string) {
    const where: Prisma.ActivityWhereInput = {
      userId,
    };

    if (zoneId) {
      where.zoneId = zoneId;
    }

    const [total, enterCount, exitCount, activities] = await Promise.all([
      prisma.activity.count({ where }),
      prisma.activity.count({ where: { ...where, type: 'enter' } }),
      prisma.activity.count({ where: { ...where, type: 'exit' } }),
      prisma.activity.findMany({
        where,
        select: { zoneId: true, zoneName: true },
        take: 1000, // Limit for aggregation
      }),
    ]);

    // Count activities by zone
    const zoneCounts: Record<string, { name: string; count: number }> = {};
    activities.forEach(activity => {
      if (!zoneCounts[activity.zoneId]) {
        zoneCounts[activity.zoneId] = {
          name: activity.zoneName,
          count: 0,
        };
      }
      zoneCounts[activity.zoneId].count++;
    });

    const mostVisitedZone = Object.entries(zoneCounts)
      .sort((a, b) => b[1].count - a[1].count)[0];

    return {
      total,
      enterCount,
      exitCount,
      mostVisitedZone: mostVisitedZone
        ? { id: mostVisitedZone[0], name: mostVisitedZone[1].name, visitCount: mostVisitedZone[1].count }
        : null,
    };
  }
}

export default new ActivityRepository();

