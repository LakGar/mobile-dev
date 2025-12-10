import { Router } from 'express';
import { z } from 'zod';
import activityController from '@/controllers/activity.controller';
import { validate, validateQuery } from '@/middleware/validation.middleware';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const createActivitySchema = z.object({
  zoneId: z.string().uuid('Invalid zone ID'),
  type: z.enum(['enter', 'exit'], {
    errorMap: () => ({ message: 'Type must be "enter" or "exit"' }),
  }),
});

const querySchema = z.object({
  zoneId: z.string().uuid().optional(),
  type: z.enum(['enter', 'exit']).optional(),
  sort: z.enum(['recent', 'oldest', 'zone']).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});

// Routes
router.get('/', validateQuery(querySchema), activityController.getActivities);
router.get('/stats', validateQuery(z.object({ zoneId: z.string().uuid().optional() })), activityController.getStatistics);
router.post('/', validate(createActivitySchema), activityController.createActivity);

export default router;

