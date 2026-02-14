/**
 * Assessment Results API
 * POST /api/assessment-results - Create a new assessment result
 * GET /api/assessment-results - Get assessment results (optional clientId filter)
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { executeQuery, generateId } from '@/lib/database/config';

async function postHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const body = await request.json();
    const { taskId, testName, totalScore, answers, severityLevel } = body;

    if (!testName || totalScore === undefined) {
      return NextResponse.json(
        { error: 'testName ve totalScore alanlari zorunludur' },
        { status: 400 }
      );
    }

    const resultId = generateId('ARR');

    await executeQuery(
      `INSERT INTO assessment_results (result_id, task_id, user_id, test_name, total_score, answers, severity_level, created_at)
       VALUES (:resultId, :taskId, :userId, :testName, :totalScore, :answers, :severityLevel, CURRENT_TIMESTAMP)`,
      {
        resultId,
        taskId: taskId || null,
        userId: user.userId,
        testName,
        totalScore,
        answers: answers ? JSON.stringify(answers) : null,
        severityLevel: severityLevel || null,
      },
      { autoCommit: true }
    );

    // If taskId is provided, update the assessment task status to completed
    if (taskId) {
      await executeQuery(
        `UPDATE assessment_tasks SET status = 'completed' WHERE task_id = :taskId`,
        { taskId },
        { autoCommit: true }
      );
    }

    return NextResponse.json({
      success: true,
      data: { resultId }
    }, { status: 201 });
  } catch (error) {
    console.error('Create assessment result error:', error);
    return NextResponse.json(
      { error: 'Degerlendirme sonucu kaydedilirken hata olustu' },
      { status: 500 }
    );
  }
}

async function getHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    // If clientId is provided, the caller must be a therapist viewing their client's data
    let targetUserId = user.userId;
    if (clientId && user.role === 'terapist') {
      targetUserId = clientId;
    }

    const result = await executeQuery(
      `SELECT ar.result_id as "resultId", ar.task_id as "taskId", ar.user_id as "userId",
              ar.test_name as "testName", ar.total_score as "totalScore",
              ar.answers, ar.severity_level as "severityLevel",
              ar.created_at as "createdAt"
       FROM assessment_results ar
       WHERE ar.user_id = :userId
       ORDER BY ar.created_at DESC`,
      { userId: targetUserId }
    );

    return NextResponse.json({
      success: true,
      data: result.rows || []
    });
  } catch (error) {
    console.error('Get assessment results error:', error);
    return NextResponse.json(
      { error: 'Degerlendirme sonuclari alinirken hata olustu' },
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
