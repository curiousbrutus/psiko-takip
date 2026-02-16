/**
 * Collaborative Task Detail API
 * GET /api/collaborative-tasks/[taskId] - Get single task
 * PUT /api/collaborative-tasks/[taskId] - Update task (fields, status)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  authMiddleware,
  AuthenticatedRequest,
} from '@/middleware/auth.middleware';
import { executeQuery } from '@/lib/database/config';

async function getHandler(request: AuthenticatedRequest, taskId: string) {
  try {
    const user = request.user!;

    const result = await executeQuery(
      `SELECT ct.task_id as "taskId", ct.therapist_id as "therapistId",
              ct.client_id as "clientId", ct.title, ct.description,
              ct.task_type as "taskType", ct.fields, ct.status,
              ct.created_at as "createdAt", ct.updated_at as "updatedAt",
              u.display_name as "clientName",
              t.display_name as "therapistName"
       FROM collaborative_tasks ct
       LEFT JOIN users u ON ct.client_id = u.user_id
       LEFT JOIN users t ON ct.therapist_id = t.user_id
       WHERE ct.task_id = :taskId`,
      { taskId }
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ error: 'Gorev bulunamadi' }, { status: 404 });
    }

    const row: any = result.rows[0];

    // Verify user has access to this task
    if (
      row.therapistId !== user.userId &&
      row.clientId !== user.userId &&
      row.THERAPIST_ID !== user.userId &&
      row.CLIENT_ID !== user.userId
    ) {
      return NextResponse.json(
        { error: 'Bu goreve erisim yetkiniz yok' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: row,
    });
  } catch (error) {
    console.error('Get collaborative task error:', error);
    return NextResponse.json(
      { error: 'Gorev alinirken hata olustu' },
      { status: 500 }
    );
  }
}

async function putHandler(request: AuthenticatedRequest, taskId: string) {
  try {
    const user = request.user!;
    const body = await request.json();
    const { fields, status } = body;

    // Verify the task exists and user has access
    const existing = await executeQuery(
      'SELECT therapist_id as "therapistId", client_id as "clientId" FROM collaborative_tasks WHERE task_id = :taskId',
      { taskId }
    );

    if (!existing.rows || existing.rows.length === 0) {
      return NextResponse.json({ error: 'Gorev bulunamadi' }, { status: 404 });
    }

    const row: any = existing.rows[0];
    const therapistId = row.therapistId || row.THERAPIST_ID;
    const clientId = row.clientId || row.CLIENT_ID;

    if (therapistId !== user.userId && clientId !== user.userId) {
      return NextResponse.json(
        { error: 'Bu gorevi guncelleme yetkiniz yok' },
        { status: 403 }
      );
    }

    // Build dynamic update
    const updates: string[] = [];
    const binds: any = { taskId };

    if (fields !== undefined) {
      updates.push('fields = :fields');
      binds.fields = JSON.stringify(fields);
    }

    if (status !== undefined) {
      updates.push('status = :status');
      binds.status = status;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    await executeQuery(
      `UPDATE collaborative_tasks SET ${updates.join(', ')} WHERE task_id = :taskId`,
      binds,
      { autoCommit: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update collaborative task error:', error);
    return NextResponse.json(
      { error: 'Gorev guncellenirken hata olustu' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  return authMiddleware(request, req => getHandler(req, taskId));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  return authMiddleware(request, req => putHandler(req, taskId));
}
