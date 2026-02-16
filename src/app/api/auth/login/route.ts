/**
 * User Login API
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateTokenPair,
  verifyPassword,
  validateEmail,
} from '@/lib/auth/jwt';
import {
  getUserWithPassword,
  updateLastLogin,
} from '@/lib/database/users.repository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-posta ve şifre zorunludur' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta adresi' },
        { status: 400 }
      );
    }

    // Get user with password hash
    const user = await getUserWithPassword(email);

    if (!user) {
      return NextResponse.json(
        { error: 'E-posta veya şifre hatalı' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'E-posta veya şifre hatalı' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: 'Hesabınız aktif değil. Lütfen yönetici ile iletişime geçin' },
        { status: 403 }
      );
    }

    // Update last login
    await updateLastLogin(user.userId);

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.userId,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    });

    return NextResponse.json({
      success: true,
      user: {
        userId: user.userId,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        connectedTherapistId: user.connectedTherapistId,
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Giriş sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
