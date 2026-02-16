/**
 * Token Refresh API
 * POST /api/auth/refresh
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateAccessToken,
  verifyRefreshToken,
  JWTPayload,
} from '@/lib/auth/jwt';
import { getUserById } from '@/lib/database/users.repository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token gerekli' },
        { status: 400 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş refresh token' },
        { status: 401 }
      );
    }

    // Get fresh user data
    const user = await getUserById(payload.userId);

    if (!user || user.status !== 'active') {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı veya aktif değil' },
        { status: 401 }
      );
    }

    // Generate new access token
    const newPayload: JWTPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    };

    const accessToken = generateAccessToken(newPayload);

    return NextResponse.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Token yenileme sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
