/**
 * Test Submissions API
 * POST /api/test-submissions - Create a new test submission
 * GET /api/test-submissions - Get test submissions (optional userId param for therapist)
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { executeQuery, generateId } from '@/lib/database/config';

async function postHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const body = await request.json();
    const { testName, totalScore, answers, severityLevel } = body;

    if (!testName || totalScore === undefined) {
      return NextResponse.json(
        { error: 'testName ve totalScore alanlari zorunludur' },
        { status: 400 }
      );
    }

    const submissionId = generateId('TST');

    await executeQuery(
      `INSERT INTO test_submissions (submission_id, user_id, test_name, total_score, answers, severity_level, created_at)
       VALUES (:submissionId, :userId, :testName, :totalScore, :answers, :severityLevel, CURRENT_TIMESTAMP)`,
      {
        submissionId,
        userId: user.userId,
        testName,
        totalScore,
        answers: answers ? JSON.stringify(answers) : null,
        severityLevel: severityLevel || null,
      },
      { autoCommit: true }
    );

    return NextResponse.json({
      success: true,
      data: { submissionId }
    }, { status: 201 });
  } catch (error) {
    console.error('Create test submission error:', error);
    return NextResponse.json(
      { error: 'Test sonucu kaydedilirken hata olustu' },
      { status: 500 }
    );
  }
}

async function getHandler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // If userId is provided, the caller must be a therapist viewing their client's data
    let targetUserId = user.userId;
    if (userId && user.role === 'terapist') {
      targetUserId = userId;
    }

    const result = await executeQuery(
      `SELECT submission_id as "submissionId", user_id as "userId", test_name as "testName",
              total_score as "totalScore", answers, severity_level as "severityLevel",
              created_at as "createdAt"
       FROM test_submissions WHERE user_id = :userId
       ORDER BY created_at DESC`,
      { userId: targetUserId }
    );

    return NextResponse.json({
      success: true,
      data: result.rows || []
    });
  } catch (error) {
    console.error('Get test submissions error:', error);
    return NextResponse.json(
      { error: 'Test sonuclari alinirken hata olustu' },
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
