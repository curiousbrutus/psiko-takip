/**
 * Mood Entries API
 * POST /api/mood-entries - Create a new mood entry
 * GET /api/mood-entries - Get mood entries (with optional startDate filter)
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { executeQuery, generateId } from '@/lib/database/config';

async function postHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const body = await request.json();
    const { mood, period, notes } = body;

    if (!mood) {
      return NextResponse.json(
        { error: 'mood alani zorunludur' },
        { status: 400 }
      );
    }

    const entryId = generateId('MOD');

    await executeQuery(
      `INSERT INTO mood_entries (entry_id, user_id, mood, period, notes, created_at)
       VALUES (:entryId, :userId, :mood, :period, :notes, CURRENT_TIMESTAMP)`,
      {
        entryId,
        userId: user.userId,
        mood,
        period: period || null,
        notes: notes || null,
      },
      { autoCommit: true }
    );

    return NextResponse.json({
      success: true,
      data: { entryId }
    }, { status: 201 });
  } catch (error) {
    console.error('Create mood entry error:', error);
    return NextResponse.json(
      { error: 'Ruh hali kaydedilirken hata olustu' },
      { status: 500 }
    );
  }
}

async function getHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');

    let sql = `SELECT entry_id as "entryId", user_id as "userId", mood, period, notes,
                      created_at as "createdAt"
               FROM mood_entries WHERE user_id = :userId`;
    const binds: any = { userId: user.userId };

    if (startDate) {
      sql += ` AND created_at >= TO_TIMESTAMP(:startDate, 'YYYY-MM-DD')`;
      binds.startDate = startDate;
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await executeQuery(sql, binds);

    return NextResponse.json({
      success: true,
      data: result.rows || []
    });
  } catch (error) {
    console.error('Get mood entries error:', error);
    return NextResponse.json(
      { error: 'Ruh hali kayitlari alinirken hata olustu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return authMiddleware(request, postHandler);
}

export async function GET(request: NextRequest) {
  return authMiddleware(request, getHandler);
}
