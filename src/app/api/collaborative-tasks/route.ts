/**
 * Collaborative Tasks API
 * POST /api/collaborative-tasks - Create a new collaborative task
 * GET /api/collaborative-tasks - Get collaborative tasks (optional clientId filter)
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { executeQuery, generateId } from '@/lib/database/config';

async function postHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const body = await request.json();
    const { clientId, title, description, taskType, fields } = body;

    if (!clientId || !title) {
      return NextResponse.json(
        { error: 'clientId ve title alanlari zorunludur' },
        { status: 400 }
      );
    }

    const taskId = generateId('CTK');

    await executeQuery(
      `INSERT INTO collaborative_tasks (task_id, therapist_id, client_id, title, description, task_type, fields, status, created_at)
       VALUES (:taskId, :therapistId, :clientId, :title, :description, :taskType, :fields, 'pending', CURRENT_TIMESTAMP)`,
      {
        taskId,
        therapistId: user.userId,
        clientId,
        title,
        description: description || null,
        taskType: taskType || 'general',
        fields: fields ? JSON.stringify(fields) : null,
      },
      { autoCommit: true }
    );

    return NextResponse.json({
      success: true,
      data: { taskId }
    }, { status: 201 });
  } catch (error) {
    console.error('Create collaborative task error:', error);
    return NextResponse.json(
      { error: 'Gorev olusturulurken hata olustu' },
      { status: 500 }
    );
  }
}

async function getHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    let sql = `SELECT ct.task_id as "taskId", ct.therapist_id as "therapistId",
                      ct.client_id as "clientId", ct.title, ct.description,
                      ct.task_type as "taskType", ct.fields, ct.status,
                      ct.created_at as "createdAt", ct.updated_at as "updatedAt",
                      u.display_name as "clientName"
               FROM collaborative_tasks ct
               LEFT JOIN users u ON ct.client_id = u.user_id
               WHERE 1=1`;
    const binds: any = {};

    if (user.role === 'terapist') {
      sql += ` AND ct.therapist_id = :therapistId`;
      binds.therapistId = user.userId;
      if (clientId) {
        sql += ` AND ct.client_id = :clientId`;
        binds.clientId = clientId;
      }
    } else {
      sql += ` AND ct.client_id = :clientId`;
      binds.clientId = user.userId;
    }

    sql += ` ORDER BY ct.created_at DESC`;

    const result = await executeQuery(sql, binds);

    return NextResponse.json({
      success: true,
      data: result.rows || []
    });
  } catch (error) {
    console.error('Get collaborative tasks error:', error);
    return NextResponse.json(
      { error: 'Gorevler alinirken hata olustu' },
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
