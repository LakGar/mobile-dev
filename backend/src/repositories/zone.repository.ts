import prisma from '@/config/database';
import { Zone, Prisma } from '@prisma/client';

export interface CreateZoneData {
  userId: string;
  title: string;
  address: string;
  location: string;
  latitude: number;
  longitude: number;
  radius: number;
  icon: string;
  color: string;
  description?: string;
  notificationOption: string;
  notificationText: string;
  imageUrl?: string;
}

export interface UpdateZoneData {
  title?: string;
  address?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  icon?: string;
  color?: string;
  description?: string;
  notificationOption?: string;
  notificationText?: string;
  imageUrl?: string;
}

export interface ZoneFilters {
  userId: string;
  icon?: string;
  sortBy?: 'name' | 'date' | 'radius';
  limit?: number;
  offset?: number;
}

class ZoneRepository {
  /**
   * Create a new zone
   */
  async create(data: CreateZoneData): Promise<Zone> {
    return prisma.zone.create({
      data: {
        userId: data.userId,
        title: data.title,
        address: data.address,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius,
        icon: data.icon,
        color: data.color,
        description: data.description,
        notificationOption: data.notificationOption,
        notificationText: data.notificationText,
        imageUrl: data.imageUrl,
      },
    });
  }

  /**
   * Find zone by ID
   */
  async findById(id: string): Promise<Zone | null> {
    return prisma.zone.findUnique({
      where: { id },
    });
  }

  /**
   * Find zones by user ID with filters
   */
  async findByUserId(filters: ZoneFilters): Promise<{ zones: Zone[]; total: number }> {
    const where: Prisma.ZoneWhereInput = {
      userId: filters.userId,
      deletedAt: null,
    };

    if (filters.icon) {
      where.icon = filters.icon;
    }

    let orderBy: Prisma.ZoneOrderByWithRelationInput = {};
    switch (filters.sortBy) {
      case 'name':
        orderBy = { title: 'asc' };
        break;
      case 'radius':
        orderBy = { radius: 'asc' };
        break;
      case 'date':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [zones, total] = await Promise.all([
      prisma.zone.findMany({
        where,
        orderBy,
        take: filters.limit || 100,
        skip: filters.offset || 0,
      }),
      prisma.zone.count({ where }),
    ]);

    return { zones, total };
  }

  /**
   * Update zone
   */
  async update(id: string, data: UpdateZoneData): Promise<Zone> {
    return prisma.zone.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete zone (soft delete)
   */
  async delete(id: string): Promise<Zone> {
    return prisma.zone.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Check if zone belongs to user
   */
  async belongsToUser(zoneId: string, userId: string): Promise<boolean> {
    const zone = await prisma.zone.findFirst({
      where: {
        id: zoneId,
        userId,
        deletedAt: null,
      },
      select: { id: true },
    });
    return zone !== null;
  }
}

export default new ZoneRepository();

