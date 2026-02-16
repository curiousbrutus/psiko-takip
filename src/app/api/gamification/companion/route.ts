/**
 * Gamification Companion API
 * PUT /api/gamification/companion - Set companion type
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  authMiddleware,
  AuthenticatedRequest,
} from '@/middleware/auth.middleware';
import { executeQuery } from '@/lib/database/config';

async function putHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const body = await request.json();
    const { companionType } = body;

    if (!companionType) {
      return NextResponse.json(
        { error: 'companionType alani zorunludur' },
        { status: 400 }
      );
    }

    // Check if gamification record exists, create if not
    const existing = await executeQuery(
      'SELECT user_id FROM gamification WHERE user_id = :userId',
      { userId: user.userId }
    );

    if (!existing.rows || existing.rows.length === 0) {
      await executeQuery(
        `INSERT INTO gamification (user_id, xp, user_level, current_streak, companion_type, companion_created_at)
         VALUES (:userId, 0, 1, 0, :companionType, CURRENT_TIMESTAMP)`,
        { userId: user.userId, companionType },
        { autoCommit: true }
      );
    } else {
      await executeQuery(
        `UPDATE gamification SET companion_type = :companionType, companion_created_at = CURRENT_TIMESTAMP WHERE user_id = :userId`,
        { companionType, userId: user.userId },
        { autoCommit: true }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update companion error:', error);
    return NextResponse.json(
      { error: 'Yol arkadasi guncellenirken hata olustu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return authMiddleware(request, putHandler);
}
