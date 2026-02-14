/**
 * Therapist Clients API
 * GET /api/users/clients - Get therapist's clients
 * POST /api/users/clients - Connect client by email
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth.middleware';
import {
  getTherapistClients,
  getUserByEmail,
  connectClientToTherapist,
} from '@/lib/database/users.repository';

async function getHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;

    if (user.role !== 'terapist') {
      return NextResponse.json(
        { error: 'Bu islem sadece terapistler icin gecerlidir' },
        { status: 403 }
      );
    }

    const clients = await getTherapistClients(user.userId);

    return NextResponse.json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('Get clients error:', error);
    return NextResponse.json(
      { error: 'Danisanlar alinirken hata olustu' },
      { status: 500 }
    );
  }
}

async function postHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;

    if (user.role !== 'terapist') {
      return NextResponse.json(
        { error: 'Bu islem sadece terapistler icin gecerlidir' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'email alani zorunludur' },
        { status: 400 }
      );
    }

    // Find client by email
    const client = await getUserByEmail(email);

    if (!client) {
      return NextResponse.json(
        { error: 'Bu e-posta adresine sahip kullanici bulunamadi' },
        { status: 404 }
      );
    }

    if (client.role !== 'danisan') {
      return NextResponse.json(
        { error: 'Bu kullanici bir danisan degil' },
        { status: 400 }
      );
    }

    if (client.connectedTherapistId) {
      return NextResponse.json(
        { error: 'Bu danisan zaten bir terapiste bagli' },
        { status: 400 }
      );
    }

    // Connect client to therapist
    await connectClientToTherapist(client.userId, user.userId);

    return NextResponse.json({
      success: true,
      message: 'Danisan basariyla baglandi',
      data: {
        clientId: client.userId,
        clientName: client.displayName,
        clientEmail: client.email,
      }
    });
  } catch (error) {
    console.error('Connect client error:', error);
    return NextResponse.json(
      { error: 'Danisan baglanirken hata olustu' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return authMiddleware(request, getHandler);
}

export async function POST(request: NextRequest) {
  return authMiddleware(request, postHandler);
}
