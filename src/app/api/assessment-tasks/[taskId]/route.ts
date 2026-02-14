/**
 * Assessment Task Detail API
 * GET /api/assessment-tasks/[taskId] - Get single assessment task
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { executeQuery } from '@/lib/database/config';

async function getHandler(request: AuthenticatedRequest, taskId: string) {
  try {
    const user = request.user!;

    const result = await executeQuery(
      `SELECT at2.task_id as "taskId", at2.therapist_id as "therapistId",
              at2.client_id as "clientId", at2.test_name as "testName",
              at2.due_date as "dueDate", at2.notes, at2.status,
              at2.created_at as "createdAt",
              u.display_name as "clientName",
              t.display_name as "therapistName"
       FROM assessment_tasks at2
       LEFT JOIN users u ON at2.client_id = u.user_id
       LEFT JOIN users t ON at2.therapist_id = t.user_id
       WHERE at2.task_id = :taskId`,
      { taskId }
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Degerlendirme gorevi bulunamadi' },
        { status: 404 }
      );
    }

    const row: any = result.rows[0];

    // Verify user has access to this task
    const therapistId = row.therapistId || row.THERAPIST_ID;
    const clientId = row.clientId || row.CLIENT_ID;

    if (therapistId !== user.userId && clientId !== user.userId) {
      return NextResponse.json(
        { error: 'Bu goreve erisim yetkiniz yok' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: row
    });
  } catch (error) {
    console.error('Get assessment task error:', error);
    return NextResponse.json(
      { error: 'Degerlendirme gorevi alinirken hata olustu' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  return authMiddleware(request, (req) => getHandler(req, taskId));
}
