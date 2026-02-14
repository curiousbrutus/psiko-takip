/**
 * Appointments API
 * POST /api/appointments - Create a new appointment
 * GET /api/appointments - Get appointments (filter by role - client or therapist)
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { executeQuery, generateId } from '@/lib/database/config';

async function postHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const body = await request.json();
    const { clientId, appointmentDate, appointmentType, durationMinutes, description } = body;

    if (!clientId || !appointmentDate) {
      return NextResponse.json(
        { error: 'clientId ve appointmentDate alanlari zorunludur' },
        { status: 400 }
      );
    }

    const appointmentId = generateId('APT');

    await executeQuery(
      `INSERT INTO appointments (appointment_id, therapist_id, client_id, appointment_date, appointment_type, duration_minutes, description, status, created_at)
       VALUES (:appointmentId, :therapistId, :clientId, TO_TIMESTAMP(:appointmentDate, 'YYYY-MM-DD"T"HH24:MI:SS'), :appointmentType, :durationMinutes, :description, 'scheduled', CURRENT_TIMESTAMP)`,
      {
        appointmentId,
        therapistId: user.userId,
        clientId,
        appointmentDate,
        appointmentType: appointmentType || 'online',
        durationMinutes: durationMinutes || 50,
        description: description || null,
      },
      { autoCommit: true }
    );

    return NextResponse.json({
      success: true,
      data: { appointmentId }
    }, { status: 201 });
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { error: 'Randevu olusturulurken hata olustu' },
      { status: 500 }
    );
  }
}

async function getHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;

    let sql: string;
    const binds: any = { userId: user.userId };

    if (user.role === 'terapist') {
      sql = `SELECT a.appointment_id as "appointmentId", a.therapist_id as "therapistId",
                    a.client_id as "clientId", a.appointment_date as "appointmentDate",
                    a.appointment_type as "appointmentType", a.duration_minutes as "durationMinutes",
                    a.description, a.status, a.created_at as "createdAt",
                    u.display_name as "clientName", u.email as "clientEmail"
             FROM appointments a
             LEFT JOIN users u ON a.client_id = u.user_id
             WHERE a.therapist_id = :userId
             ORDER BY a.appointment_date DESC`;
    } else {
      sql = `SELECT a.appointment_id as "appointmentId", a.therapist_id as "therapistId",
                    a.client_id as "clientId", a.appointment_date as "appointmentDate",
                    a.appointment_type as "appointmentType", a.duration_minutes as "durationMinutes",
                    a.description, a.status, a.created_at as "createdAt",
                    u.display_name as "therapistName", u.email as "therapistEmail"
             FROM appointments a
             LEFT JOIN users u ON a.therapist_id = u.user_id
             WHERE a.client_id = :userId
             ORDER BY a.appointment_date DESC`;
    }

    const result = await executeQuery(sql, binds);

    return NextResponse.json({
      success: true,
      data: result.rows || []
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      { error: 'Randevular alinirken hata olustu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return authMiddleware(request, postHandler);
}

export async function GET(request: NextRequest) {
  return authMiddleware(request, getHandler);
}
