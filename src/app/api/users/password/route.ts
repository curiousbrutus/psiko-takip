/**
 * User Password API
 * PUT /api/users/password - Change password (requires current password verification)
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { verifyPassword, validatePassword } from '@/lib/auth/jwt';
import { updateUserPassword } from '@/lib/database/users.repository';
import { executeQuery } from '@/lib/database/config';

async function putHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Mevcut sifre ve yeni sifre alanlari zorunludur' },
        { status: 400 }
      );
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Get current password hash from database
    const result = await executeQuery(
      'SELECT password_hash as "passwordHash" FROM users WHERE user_id = :userId',
      { userId: user.userId }
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Kullanici bulunamadi' },
        { status: 404 }
      );
    }

    const row: any = result.rows[0];
    const passwordHash = row.passwordHash || row.PASSWORD_HASH;

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, passwordHash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Mevcut sifre hatali' },
        { status: 401 }
      );
    }

    // Update password
    await updateUserPassword(user.userId, newPassword);

    return NextResponse.json({
      success: true,
      message: 'Sifre basariyla guncellendi'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Sifre degistirilirken hata olustu' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return authMiddleware(request, putHandler);
}
