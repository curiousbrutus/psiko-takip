/**
 * Assessment Tasks API
 * POST /api/assessment-tasks - Create a new assessment task
 * GET /api/assessment-tasks - Get assessment tasks (optional clientId filter)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  authMiddleware,
  AuthenticatedRequest,
} from '@/middleware/auth.middleware';
import { executeQuery, generateId } from '@/lib/database/config';

async function postHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const body = await request.json();
    const { clientId, testName, dueDate, notes } = body;

    if (!clientId || !testName) {
      return NextResponse.json(
        { error: 'clientId ve testName alanlari zorunludur' },
        { status: 400 }
      );
    }

    const taskId = generateId('ATK');

    await executeQuery(
      `INSERT INTO assessment_tasks (task_id, therapist_id, client_id, test_name, due_date, notes, status, created_at)
       VALUES (:taskId, :therapistId, :clientId, :testName, TO_TIMESTAMP(:dueDate, 'YYYY-MM-DD"T"HH24:MI:SS'), :notes, 'pending', CURRENT_TIMESTAMP)`,
      {
        taskId,
        therapistId: user.userId,
        clientId,
        testName,
        dueDate: dueDate || null,
        notes: notes || null,
      },
      { autoCommit: true }
    );

    return NextResponse.json(
      {
        success: true,
        data: { taskId },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create assessment task error:', error);
    return NextResponse.json(
      { error: 'Degerlendirme gorevi olusturulurken hata olustu' },
      { status: 500 }
    );
  }
}

async function getHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    let sql = `SELECT at2.task_id as "taskId", at2.therapist_id as "therapistId",
                      at2.client_id as "clientId", at2.test_name as "testName",
                      at2.due_date as "dueDate", at2.notes, at2.status,
                      at2.created_at as "createdAt",
                      u.display_name as "clientName",
                      t.display_name as "therapistName"
               FROM assessment_tasks at2
               LEFT JOIN users u ON at2.client_id = u.user_id
               LEFT JOIN users t ON at2.therapist_id = t.user_id
               WHERE 1=1`;
    const binds: any = {};

    if (user.role === 'terapist') {
      sql += ` AND at2.therapist_id = :therapistId`;
      binds.therapistId = user.userId;
      if (clientId) {
        sql += ` AND at2.client_id = :clientId`;
        binds.clientId = clientId;
      }
    } else {
      sql += ` AND at2.client_id = :clientId`;
      binds.clientId = user.userId;
    }

    sql += ` ORDER BY at2.created_at DESC`;

    const result = await executeQuery(sql, binds);

    return NextResponse.json({
      success: true,
      data: result.rows || [],
    });
  } catch (error) {
    console.error('Get assessment tasks error:', error);
    return NextResponse.json(
      { error: 'Degerlendirme gorevleri alinirken hata olustu' },
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
