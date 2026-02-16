/**
 * Gratitude Entries API
 * POST /api/gratitude-entries - Create a new gratitude jar entry
 * GET /api/gratitude-entries - Get gratitude entries
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
    const { content, category } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'content alani zorunludur' },
        { status: 400 }
      );
    }

    const entryId = generateId('GRT');

    await executeQuery(
      `INSERT INTO gratitude_entries (entry_id, user_id, content, category, created_at)
       VALUES (:entryId, :userId, :content, :category, CURRENT_TIMESTAMP)`,
      {
        entryId,
        userId: user.userId,
        content,
        category: category || null,
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
    console.error('Create gratitude entry error:', error);
    return NextResponse.json(
      { error: 'Sukran kaydi olusturulurken hata olustu' },
      { status: 500 }
    );
  }
}

async function getHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;

    const result = await executeQuery(
      `SELECT entry_id as "entryId", user_id as "userId", content, category,
              created_at as "createdAt"
       FROM gratitude_entries WHERE user_id = :userId
       ORDER BY created_at DESC`,
      { userId: user.userId }
    );

    return NextResponse.json({
      success: true,
      data: result.rows || [],
    });
  } catch (error) {
    console.error('Get gratitude entries error:', error);
    return NextResponse.json(
      { error: 'Sukran kayitlari alinirken hata olustu' },
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
