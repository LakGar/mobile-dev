import zoneRepository from '@/repositories/zone.repository';
import { NotFoundError, ForbiddenError, ValidationError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export interface CreateZoneData {
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
  icon?: string;
  sortBy?: 'name' | 'date' | 'radius';
  limit?: number;
  offset?: number;
}

class ZoneService {
  /**
   * Create a new zone
   */
  async createZone(userId: string, data: CreateZoneData) {
    const startTime = Date.now();

    // Validate coordinates
    if (data.latitude < -90 || data.latitude > 90) {
      throw new ValidationError('Latitude must be between -90 and 90');
    }
    if (data.longitude < -180 || data.longitude > 180) {
      throw new ValidationError('Longitude must be between -180 and 180');
    }
    if (data.radius <= 0) {
      throw new ValidationError('Radius must be greater than 0');
    }

    const zone = await zoneRepository.create({
      ...data,
      userId,
    });

    logger.info('Zone created', {
      zoneId: zone.id,
      userId,
      duration: Date.now() - startTime,
    });

    return this.formatZone(zone);
  }

  /**
   * Get zone by ID
   */
  async getZoneById(zoneId: string, userId: string) {
    const zone = await zoneRepository.findById(zoneId);
    
    if (!zone || zone.deletedAt) {
      throw new NotFoundError('Zone');
    }

    // Check ownership
    if (zone.userId !== userId) {
      throw new ForbiddenError('You do not have access to this zone');
    }

    return this.formatZone(zone);
  }

  /**
   * Get zones for user
   */
  async getZones(userId: string, filters: ZoneFilters) {
    const startTime = Date.now();

    const result = await zoneRepository.findByUserId({
      userId,
      ...filters,
    });

    logger.info('Zones retrieved', {
      userId,
      count: result.zones.length,
      duration: Date.now() - startTime,
    });

    return {
      zones: result.zones.map(zone => this.formatZone(zone)),
      total: result.total,
    };
  }

  /**
   * Update zone
   */
  async updateZone(zoneId: string, userId: string, data: UpdateZoneData) {
    const startTime = Date.now();

    // Verify zone exists and belongs to user
    const zone = await zoneRepository.findById(zoneId);
    if (!zone || zone.deletedAt) {
      throw new NotFoundError('Zone');
    }
    if (zone.userId !== userId) {
      throw new ForbiddenError('You do not have permission to update this zone');
    }

    // Validate coordinates if provided
    if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
      throw new ValidationError('Latitude must be between -90 and 90');
    }
    if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
      throw new ValidationError('Longitude must be between -180 and 180');
    }
    if (data.radius !== undefined && data.radius <= 0) {
      throw new ValidationError('Radius must be greater than 0');
    }

    const updatedZone = await zoneRepository.update(zoneId, data);

    logger.info('Zone updated', {
      zoneId,
      userId,
      fields: Object.keys(data),
      duration: Date.now() - startTime,
    });

    return this.formatZone(updatedZone);
  }

  /**
   * Delete zone
   */
  async deleteZone(zoneId: string, userId: string) {
    const startTime = Date.now();

    // Verify zone exists and belongs to user
    const zone = await zoneRepository.findById(zoneId);
    if (!zone || zone.deletedAt) {
      throw new NotFoundError('Zone');
    }
    if (zone.userId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this zone');
    }

    await zoneRepository.delete(zoneId);

    logger.info('Zone deleted', {
      zoneId,
      userId,
      duration: Date.now() - startTime,
    });

    return { message: 'Zone deleted successfully' };
  }

  /**
   * Format zone for response
   */
  private formatZone(zone: any) {
    return {
      id: zone.id,
      title: zone.title,
      address: zone.address,
      location: zone.location,
      latitude: Number(zone.latitude),
      longitude: Number(zone.longitude),
      radius: zone.radius,
      icon: zone.icon,
      color: zone.color,
      description: zone.description,
      notificationOption: zone.notificationOption,
      notificationText: zone.notificationText,
      image: zone.imageUrl,
      createdAt: zone.createdAt.toISOString(),
      updatedAt: zone.updatedAt.toISOString(),
    };
  }
}

export default new ZoneService();

