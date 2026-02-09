/**
 * Logout API
 * POST /api/auth/logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth.middleware';

async function logoutHandler(request: AuthenticatedRequest) {
  try {
    // In a more complete implementation, you would:
    // 1. Invalidate the refresh token in the database
    // 2. Add the access token to a blacklist (if using one)
    // 3. Clear any server-side session data
    
    // For now, logout is handled primarily on the client side
    // by removing the tokens from local storage
    
    return NextResponse.json({
      success: true,
      message: 'Başarıyla çıkış yapıldı',
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Çıkış yaparken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return authMiddleware(request, logoutHandler);
}
