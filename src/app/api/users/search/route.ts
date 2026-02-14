/**
 * User Search API
 * GET /api/users/search - Search users by query and optional role
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { searchUsers } from '@/lib/database/users.repository';

async function getHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query');
    const role = searchParams.get('role');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Arama sorgusu en az 2 karakter olmalidir' },
        { status: 400 }
      );
    }

    const users = await searchUsers(query.trim(), role || undefined);

    return NextResponse.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Search users error:', error);
    return NextResponse.json(
      { error: 'Kullanici aramasinda hata olustu' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return authMiddleware(request, getHandler);
}
