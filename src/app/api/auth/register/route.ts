/**
 * User Registration API
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateTokenPair,
  validateEmail,
  validatePassword,
} from '@/lib/auth/jwt';
import { createUser, CreateUserData } from '@/lib/database/users.repository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, displayName, role } = body;

    // Validate input
    if (!email || !password || !displayName || !role) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      );
    }

    // Validate email
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Geçersiz e-posta adresi' },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Validate role
    if (!['danisan', 'terapist', 'kurum_yoneticisi'].includes(role)) {
      return NextResponse.json(
        { error: 'Geçersiz kullanıcı rolü' },
        { status: 400 }
      );
    }

    // Create user
    const userData: CreateUserData = {
      email,
      password,
      displayName,
      role,
    };

    const user = await createUser(userData);

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.userId,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          userId: user.userId,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        },
        ...tokens,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle duplicate email error
    if (
      error.message?.includes('ORA-00001') ||
      error.message?.includes('unique constraint')
    ) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Kayıt sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
