/**
 * User Profile API
 * PUT /api/users/profile - Update user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { updateUserProfile, getUserById } from '@/lib/database/users.repository';

async function putHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const body = await request.json();
    const { displayName, phone } = body;

    if (!displayName && !phone) {
      return NextResponse.json(
        { error: 'Guncellenecek en az bir alan gereklidir (displayName veya phone)' },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserProfile(user.userId, {
      displayName: displayName || undefined,
      phone: phone || undefined,
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Profil guncellenirken hata olustu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return authMiddleware(request, putHandler);
}
