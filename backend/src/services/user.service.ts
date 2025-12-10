import userRepository from '@/repositories/user.repository';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { hashPassword, comparePassword, validatePasswordStrength } from '@/utils/password';
import { logger } from '@/utils/logger';

export interface UpdateUserData {
  name?: string;
  bio?: string;
  phone?: string;
  gender?: string;
  profileImageUrl?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class UserService {
  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await userRepository.findById(userId);
    
    if (!user || user.deletedAt) {
      throw new NotFoundError('User');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      bio: user.bio,
      profileImageUrl: user.profileImageUrl,
      phone: user.phone,
      gender: user.gender,
      streak: user.streak,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, data: UpdateUserData) {
    const startTime = Date.now();

    // Verify user exists
    const existingUser = await userRepository.findById(userId);
    if (!existingUser || existingUser.deletedAt) {
      throw new NotFoundError('User');
    }

    // Update user
    const updatedUser = await userRepository.update(userId, data);

    logger.info('User updated', {
      userId,
      fields: Object.keys(data),
      duration: Date.now() - startTime,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      name: updatedUser.name,
      bio: updatedUser.bio,
      profileImageUrl: updatedUser.profileImageUrl,
      phone: updatedUser.phone,
      gender: updatedUser.gender,
      streak: updatedUser.streak,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, data: ChangePasswordData) {
    const startTime = Date.now();

    // Get user
    const user = await userRepository.findById(userId);
    if (!user || user.deletedAt) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isValidPassword = await comparePassword(data.currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new ValidationError('Current password is incorrect');
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(data.newPassword);
    if (!passwordValidation.valid) {
      throw new ValidationError('New password does not meet requirements', {
        password: passwordValidation.errors.join(', '),
      });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(data.newPassword);

    // Update password
    await userRepository.updatePassword(userId, newPasswordHash);

    logger.info('Password changed', {
      userId,
      duration: Date.now() - startTime,
    });

    return { message: 'Password updated successfully' };
  }

  /**
   * Update user streak
   */
  async updateStreak(userId: string, increment: boolean = true) {
    const user = await userRepository.findById(userId);
    if (!user || user.deletedAt) {
      throw new NotFoundError('User');
    }

    const newStreak = increment ? user.streak + 1 : 0;
    await userRepository.update(userId, { streak: newStreak });

    return { streak: newStreak };
  }
}

export default new UserService();

