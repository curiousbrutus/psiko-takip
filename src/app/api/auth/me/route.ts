/**
 * Current User API
 * GET /api/auth/me
 *
 * Returns the current authenticated user's data from token + database
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { getUserById } from '@/lib/database/users.repository';

async function handler(request: AuthenticatedRequest) {
  try {
    const tokenUser = request.user!;
    const user = await getUserById(tokenUser.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanici bulunamadi' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Kullanici bilgileri alinirken hata olustu' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return authMiddleware(request, handler);
}
