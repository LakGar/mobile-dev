import { Router } from 'express';
import { z } from 'zod';
import userController from '@/controllers/user.controller';
import { validate } from '@/middleware/validation.middleware';
import { authenticate } from '@/middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// Routes
router.get('/me', userController.getCurrentUser);
router.put('/me', validate(updateUserSchema), userController.updateCurrentUser);
router.put('/me/password', validate(changePasswordSchema), userController.changePassword);

export default router;

