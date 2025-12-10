import prisma from '@/config/database';
import { Session } from '@prisma/client';
import { hashPassword } from '@/utils/password';

export interface CreateSessionData {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
}

class SessionRepository {
  /**
   * Create a new session
   */
  async create(data: CreateSessionData): Promise<Session> {
    // Hash the refresh token before storing
    const tokenHash = await hashPassword(data.refreshToken);
    
    return prisma.session.create({
      data: {
        userId: data.userId,
        tokenHash,
        expiresAt: data.expiresAt,
      },
    });
  }

  /**
   * Find session by user ID
   */
  async findByUserId(userId: string): Promise<Session[]> {
    return prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete session by ID
   */
  async delete(id: string): Promise<void> {
    await prisma.session.delete({
      where: { id },
    });
  }

  /**
   * Delete all sessions for a user
   */
  async deleteAllByUserId(userId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { userId },
    });
  }

  /**
   * Delete expired sessions
   */
  async deleteExpired(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }

  /**
   * Verify refresh token (check if session exists and is valid)
   */
  async verifyRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const sessions = await this.findByUserId(userId);
    const { comparePassword } = await import('@/utils/password');
    
    for (const session of sessions) {
      if (session.expiresAt < new Date()) {
        continue; // Skip expired sessions
      }
      
      const isValid = await comparePassword(refreshToken, session.tokenHash);
      if (isValid) {
        return true;
      }
    }
    
    return false;
  }
}

export default new SessionRepository();

