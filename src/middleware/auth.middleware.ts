/**
 * Authentication Middleware for API Routes
 *
 * This middleware validates JWT tokens and adds user information to the request
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAccessToken,
  extractTokenFromHeader,
  JWTPayload,
} from '../lib/auth/jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Middleware to authenticate API requests
 */
export async function authMiddleware(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Yetkilendirme başlığı eksik' },
        { status: 401 }
      );
    }

    const user = verifyAccessToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş token' },
        { status: 401 }
      );
    }

    // Add user to request
    (request as AuthenticatedRequest).user = user;

    return await handler(request as AuthenticatedRequest);
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return NextResponse.json(
      { error: 'Kimlik doğrulama hatası' },
      { status: 401 }
    );
  }
}

/**
 * Middleware to check user role
 */
export async function roleMiddleware(
  request: AuthenticatedRequest,
  allowedRoles: string[],
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const user = request.user;

  if (!user) {
    return NextResponse.json(
      { error: 'Kullanıcı bilgisi bulunamadı' },
      { status: 401 }
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Bu işlem için yetkiniz yok' },
      { status: 403 }
    );
  }

  return await handler(request);
}

/**
 * Combined authentication and role middleware
 */
export async function authAndRoleMiddleware(
  request: NextRequest,
  allowedRoles: string[],
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return authMiddleware(request, async authReq => {
    return roleMiddleware(authReq, allowedRoles, handler);
  });
}

/**
 * Extract user from request
 */
export function getUserFromRequest(
  request: AuthenticatedRequest
): JWTPayload | null {
  return request.user || null;
}

/**
 * Check if user is therapist
 */
export function isTherapist(request: AuthenticatedRequest): boolean {
  return request.user?.role === 'terapist';
}

/**
 * Check if user is client
 */
export function isClient(request: AuthenticatedRequest): boolean {
  return request.user?.role === 'danisan';
}

/**
 * Check if user is admin
 */
export function isAdmin(request: AuthenticatedRequest): boolean {
  return request.user?.role === 'kurum_yoneticisi';
}

export default {
  authMiddleware,
  roleMiddleware,
  authAndRoleMiddleware,
  getUserFromRequest,
  isTherapist,
  isClient,
  isAdmin,
};
