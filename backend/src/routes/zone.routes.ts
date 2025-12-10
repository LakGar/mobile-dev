import { Router } from 'express';
import { z } from 'zod';
import zoneController from '@/controllers/zone.controller';
import { validate, validateQuery, validateParams } from '@/middleware/validation.middleware';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const createZoneSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  address: z.string().min(1, 'Address is required'),
  location: z.string().min(1, 'Location is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().positive('Radius must be positive'),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
  description: z.string().optional(),
  notificationOption: z.enum(['enter', 'exit', 'both']).default('both'),
  notificationText: z.string().default('You have entered the zone'),
  imageUrl: z.string().url().optional(),
});

const updateZoneSchema = z.object({
  title: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radius: z.number().positive().optional(),
  icon: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  description: z.string().optional(),
  notificationOption: z.enum(['enter', 'exit', 'both']).optional(),
  notificationText: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

const zoneIdSchema = z.object({
  id: z.string().uuid('Invalid zone ID'),
});

const querySchema = z.object({
  filter: z.string().optional(),
  sort: z.enum(['name', 'date', 'radius']).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});

// Routes
router.get('/', validateQuery(querySchema), zoneController.getZones);
router.get('/:id', validateParams(zoneIdSchema), zoneController.getZone);
router.post('/', validate(createZoneSchema), zoneController.createZone);
router.put('/:id', validateParams(zoneIdSchema), validate(updateZoneSchema), zoneController.updateZone);
router.delete('/:id', validateParams(zoneIdSchema), zoneController.deleteZone);

export default router;

