/**
 * Journal Entries API
 * POST /api/journal-entries - Create a new journal entry
 * GET /api/journal-entries - Get journal entries (with optional filters)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  authMiddleware,
  AuthenticatedRequest,
} from '@/middleware/auth.middleware';
import { executeQuery, generateId } from '@/lib/database/config';

async function postHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const body = await request.json();
    const { content, prompt, isShared } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'content alani zorunludur' },
        { status: 400 }
      );
    }

    const entryId = generateId('JRN');

    await executeQuery(
      `INSERT INTO journal_entries (entry_id, user_id, content, prompt, is_shared, created_at)
       VALUES (:entryId, :userId, :content, :prompt, :isShared, CURRENT_TIMESTAMP)`,
      {
        entryId,
        userId: user.userId,
        content,
        prompt: prompt || null,
        isShared: isShared ? 1 : 0,
      },
      { autoCommit: true }
    );

    return NextResponse.json(
      {
        success: true,
        data: { entryId },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create journal entry error:', error);
    return NextResponse.json(
      { error: 'Gunluk kaydedilirken hata olustu' },
      { status: 500 }
    );
  }
}

async function getHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get('prompt');
    const startDate = searchParams.get('startDate');
    const isShared = searchParams.get('isShared');
    const userId = searchParams.get('userId');

    // If userId is provided, the caller must be a therapist viewing their client's data
    let targetUserId = user.userId;
    if (userId && user.role === 'terapist') {
      targetUserId = userId;
    }

    let sql = `SELECT entry_id as "entryId", user_id as "userId", content, prompt,
                      is_shared as "isShared", created_at as "createdAt"
               FROM journal_entries WHERE user_id = :userId`;
    const binds: any = { userId: targetUserId };

    if (prompt) {
      sql += ` AND prompt = :prompt`;
      binds.prompt = prompt;
    }

    if (startDate) {
      sql += ` AND created_at >= TO_TIMESTAMP(:startDate, 'YYYY-MM-DD')`;
      binds.startDate = startDate;
    }

    if (isShared === 'true') {
      sql += ` AND is_shared = 1`;
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await executeQuery(sql, binds);

    return NextResponse.json({
      success: true,
      data: result.rows || [],
    });
  } catch (error) {
    console.error('Get journal entries error:', error);
    return NextResponse.json(
      { error: 'Gunluk kayitlari alinirken hata olustu' },
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
