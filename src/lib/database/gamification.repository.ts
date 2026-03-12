/**
 * Gamification Repository
 *
 * Data access layer for gamification operations
 */

import { executeQuery } from './config';

export interface GamificationData {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  companion: {
    type: string;
    createdAt: Date;
  } | null;
  lastActivityDate: Date | null;
  totalTasksCompleted: number;
}

/**
 * Get gamification data for a user
 */
export async function getGamification(userId: string): Promise<GamificationData> {
  const result = await executeQuery(
    `SELECT user_id, xp, user_level as "level", current_streak as "currentStreak",
            longest_streak as "longestStreak", companion_type,
            companion_created_at, last_activity_date as "lastActivityDate",
            total_tasks_completed as "totalTasksCompleted"
     FROM psk_ebg_gamification WHERE user_id = :userId`,
    { userId }
  );

  if (!result.rows || result.rows.length === 0) {
    return {
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      companion: null,
      lastActivityDate: null,
      totalTasksCompleted: 0,
    };
  }

  const row: any = result.rows[0];
  return {
    xp: row.xp || row.XP || 0,
    level: row.level || row.LEVEL || 1,
    currentStreak: row.currentStreak || row.CURRENT_STREAK || 0,
    longestStreak: row.longestStreak || row.LONGEST_STREAK || 0,
    companion:
      row.companion_type || row.COMPANION_TYPE
        ? {
            type: row.companion_type || row.COMPANION_TYPE,
            createdAt: row.companion_created_at || row.COMPANION_CREATED_AT,
          }
        : null,
    lastActivityDate: row.lastActivityDate || row.LAST_ACTIVITY_DATE || null,
    totalTasksCompleted: row.totalTasksCompleted || row.TOTAL_TASKS_COMPLETED || 0,
  };
}

/**
 * Update gamification XP
 */
export async function updateGamificationXP(userId: string, xp: number): Promise<void> {
  const existing = await executeQuery(
    'SELECT xp, user_level FROM psk_ebg_gamification WHERE user_id = :userId',
    { userId }
  );

  if (!existing.rows || existing.rows.length === 0) {
    await executeQuery(
      `INSERT INTO psk_ebg_gamification (user_id, xp, user_level, current_streak, longest_streak, last_activity_date, total_tasks_completed)
       VALUES (:userId, :xp, 1, 1, 1, CURRENT_TIMESTAMP, 1)`,
      { userId, xp: xp || 0 },
      { autoCommit: true }
    );
  } else {
    const row: any = existing.rows[0];
    const currentXp = (row.XP || row.xp || 0) + (xp || 0);
    const newLevel = Math.floor(currentXp / 100) + 1;

    await executeQuery(
      `UPDATE psk_ebg_gamification SET xp = :xp, user_level = :userLevel,
              last_activity_date = CURRENT_TIMESTAMP,
              total_tasks_completed = total_tasks_completed + 1,
              current_streak = current_streak + 1,
              longest_streak = GREATEST(longest_streak, current_streak + 1)
       WHERE user_id = :userId`,
      { xp: currentXp, userLevel: newLevel, userId },
      { autoCommit: true }
    );
  }
}

export default {
  getGamification,
  updateGamificationXP,
};
