/**
 * Gamification API
 * GET /api/gamification - Get gamification data for current user
 * PUT /api/gamification - Add XP / update gamification stats
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  authMiddleware,
  AuthenticatedRequest,
} from '@/middleware/auth.middleware';
import { executeQuery } from '@/lib/database/config';

async function getHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const result = await executeQuery(
      `SELECT user_id, xp, user_level as "level", current_streak as "currentStreak",
              longest_streak as "longestStreak", companion_type,
              companion_created_at, last_activity_date as "lastActivityDate",
              total_tasks_completed as "totalTasksCompleted"
       FROM gamification WHERE user_id = :userId`,
      { userId: user.userId }
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          xp: 0,
          level: 1,
          currentStreak: 0,
          longestStreak: 0,
          companion: null,
          lastActivityDate: null,
          totalTasksCompleted: 0,
        },
      });
    }

    const row: any = result.rows[0];
    return NextResponse.json({
      success: true,
      data: {
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
        lastActivityDate: row.lastActivityDate || row.LAST_ACTIVITY_DATE,
        totalTasksCompleted:
          row.totalTasksCompleted || row.TOTAL_TASKS_COMPLETED || 0,
      },
    });
  } catch (error) {
    console.error('Get gamification error:', error);
    return NextResponse.json(
      { error: 'Oyunlastirma verileri alinirken hata olustu' },
      { status: 500 }
    );
  }
}

async function putHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const body = await request.json();
    const { xp } = body;

    // Check if gamification record exists
    const existing = await executeQuery(
      'SELECT xp, user_level FROM gamification WHERE user_id = :userId',
      { userId: user.userId }
    );

    if (!existing.rows || existing.rows.length === 0) {
      // Create gamification record
      await executeQuery(
        `INSERT INTO gamification (user_id, xp, user_level, current_streak, longest_streak, last_activity_date, total_tasks_completed)
         VALUES (:userId, :xp, 1, 1, 1, CURRENT_TIMESTAMP, 1)`,
        { userId: user.userId, xp: xp || 0 },
        { autoCommit: true }
      );
    } else {
      const row: any = existing.rows[0];
      const currentXp = (row.XP || row.xp || 0) + (xp || 0);
      const newLevel = Math.floor(currentXp / 100) + 1;

      await executeQuery(
        `UPDATE gamification SET xp = :xp, user_level = :userLevel,
                last_activity_date = CURRENT_TIMESTAMP,
                total_tasks_completed = total_tasks_completed + 1,
                current_streak = current_streak + 1,
                longest_streak = GREATEST(longest_streak, current_streak + 1)
         WHERE user_id = :userId`,
        { xp: currentXp, userLevel: newLevel, userId: user.userId },
        { autoCommit: true }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update gamification error:', error);
    return NextResponse.json(
      { error: 'Oyunlastirma guncelleme hatasi' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return authMiddleware(request, getHandler);
}

export async function PUT(request: NextRequest) {
  return authMiddleware(request, putHandler);
}
