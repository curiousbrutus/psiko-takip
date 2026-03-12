import { Injectable } from '@nestjs/common';
import { OracleService } from '../oracle.service';

export interface GamificationRecord {
  userId?: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  companionType?: string | null;
  companionCreatedAt?: string | null;
  lastActivityDate?: string | null;
  totalTasksCompleted: number;
}

@Injectable()
export class GamificationRepository {
  constructor(private readonly oracleService: OracleService) {}

  async getGamification(userId: string): Promise<GamificationRecord> {
    const result = await this.oracleService.executeQuery<GamificationRecord>(
      `SELECT user_id as "userId", xp as "xp", user_level as "level",
              current_streak as "currentStreak", longest_streak as "longestStreak",
              companion_type as "companionType",
              companion_created_at as "companionCreatedAt",
              last_activity_date as "lastActivityDate",
              total_tasks_completed as "totalTasksCompleted"
       FROM psk_ebg_gamification
       WHERE user_id = :userId`,
      { userId }
    );

    if (!result.rows || result.rows.length === 0) {
      return {
        userId,
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        companionType: null,
        companionCreatedAt: null,
        lastActivityDate: null,
        totalTasksCompleted: 0,
      };
    }

    return result.rows[0];
  }

  async updateXp(userId: string, xp: number): Promise<void> {
    const existing = await this.oracleService.executeQuery<{ xp: number; userLevel: number }>(
      `SELECT xp as "xp", user_level as "userLevel"
       FROM psk_ebg_gamification
       WHERE user_id = :userId`,
      { userId }
    );

    if (!existing.rows || existing.rows.length === 0) {
      await this.oracleService.executeQuery(
        `INSERT INTO psk_ebg_gamification
           (user_id, xp, user_level, current_streak, longest_streak, last_activity_date, total_tasks_completed)
         VALUES (:userId, :xp, 1, 1, 1, CURRENT_TIMESTAMP, 1)`,
        { userId, xp: xp || 0 },
        { autoCommit: true }
      );
      return;
    }

    const currentXp = (existing.rows[0].xp || 0) + (xp || 0);
    const userLevel = Math.floor(currentXp / 100) + 1;

    await this.oracleService.executeQuery(
      `UPDATE psk_ebg_gamification
       SET xp = :xp,
           user_level = :userLevel,
           last_activity_date = CURRENT_TIMESTAMP,
           total_tasks_completed = total_tasks_completed + 1,
           current_streak = current_streak + 1,
           longest_streak = GREATEST(longest_streak, current_streak + 1)
       WHERE user_id = :userId`,
      { xp: currentXp, userLevel, userId },
      { autoCommit: true }
    );
  }

  async setCompanion(userId: string, companionType: string): Promise<void> {
    const existing = await this.oracleService.executeQuery<{ userId: string }>(
      `SELECT user_id as "userId"
       FROM psk_ebg_gamification
       WHERE user_id = :userId`,
      { userId }
    );

    if (!existing.rows || existing.rows.length === 0) {
      await this.oracleService.executeQuery(
        `INSERT INTO psk_ebg_gamification
           (user_id, xp, user_level, current_streak, companion_type, companion_created_at)
         VALUES (:userId, 0, 1, 0, :companionType, CURRENT_TIMESTAMP)`,
        { userId, companionType },
        { autoCommit: true }
      );
      return;
    }

    await this.oracleService.executeQuery(
      `UPDATE psk_ebg_gamification
       SET companion_type = :companionType,
           companion_created_at = CURRENT_TIMESTAMP
       WHERE user_id = :userId`,
      { companionType, userId },
      { autoCommit: true }
    );
  }
}
