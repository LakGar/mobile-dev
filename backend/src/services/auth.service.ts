import userRepository from '@/repositories/user.repository';
import sessionRepository from '@/repositories/session.repository';
import { hashPassword, comparePassword, validatePasswordStrength } from '@/utils/password';
import { generateTokenPair, TokenPayload } from '@/utils/jwt';
import { ConflictError, UnauthorizedError, ValidationError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  username?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData) {
    const startTime = Date.now();

    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      throw new ValidationError('Password does not meet requirements', {
        password: passwordValidation.errors.join(', '),
      });
    }

    // Check if email already exists
    const emailExists = await userRepository.emailExists(data.email);
    if (emailExists) {
      throw new ConflictError('Email already registered');
    }

    // Generate username if not provided
    let username = data.username;
    if (!username) {
      username = data.email.split('@')[0].toLowerCase();
      // Ensure username is unique
      let counter = 1;
      while (await userRepository.usernameExists(username)) {
        username = `${data.email.split('@')[0].toLowerCase()}${counter}`;
        counter++;
      }
    } else {
      // Check if username already exists
      const usernameExists = await userRepository.usernameExists(username);
      if (usernameExists) {
        throw new ConflictError('Username already taken');
      }
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await userRepository.create({
      email: data.email,
      passwordHash,
      username,
      name: data.name,
    });

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };
    const tokens = generateTokenPair(tokenPayload);

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await sessionRepository.create({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt,
    });

    logger.info('User registered', {
      userId: user.id,
      email: user.email,
      duration: Date.now() - startTime,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        bio: user.bio,
        profileImageUrl: user.profileImageUrl,
        streak: user.streak,
      },
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginData) {
    const startTime = Date.now();

    // Find user by email
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      logger.warn('Login attempt with invalid email', { email: data.email });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is deleted
    if (user.deletedAt) {
      throw new UnauthorizedError('Account has been deleted');
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, user.passwordHash);
    if (!isValidPassword) {
      logger.warn('Login attempt with invalid password', { userId: user.id });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };
    const tokens = generateTokenPair(tokenPayload);

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await sessionRepository.create({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt,
    });

    logger.info('User logged in', {
      userId: user.id,
      email: user.email,
      duration: Date.now() - startTime,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        bio: user.bio,
        profileImageUrl: user.profileImageUrl,
        streak: user.streak,
      },
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    const { verifyRefreshToken } = await import('@/utils/jwt');
    
    try {
      const payload = verifyRefreshToken(refreshToken);
      
      // Verify session exists
      const isValid = await sessionRepository.verifyRefreshToken(
        payload.userId,
        refreshToken
      );
      
      if (!isValid) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Generate new access token
      const newAccessToken = generateTokenPair(payload).accessToken;

      logger.info('Token refreshed', { userId: payload.userId });

      return { accessToken: newAccessToken };
    } catch (error: any) {
      logger.warn('Token refresh failed', { error: error.message });
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user (delete session)
   */
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      // Delete specific session
      const sessions = await sessionRepository.findByUserId(userId);
      const { comparePassword } = await import('@/utils/password');
      
      for (const session of sessions) {
        const isValid = await comparePassword(refreshToken, session.tokenHash);
        if (isValid) {
          await sessionRepository.delete(session.id);
          logger.info('User logged out', { userId, sessionId: session.id });
          return;
        }
      }
    } else {
      // Delete all sessions
      await sessionRepository.deleteAllByUserId(userId);
      logger.info('User logged out (all sessions)', { userId });
    }
  }
}

export default new AuthService();

