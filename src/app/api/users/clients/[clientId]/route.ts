/**
 * Client Detail API (for therapists)
 * GET /api/users/clients/[clientId] - Get detailed client data (journals, tests, appointments, tasks)
 */

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { executeQuery } from '@/lib/database/config';
import { getUserById } from '@/lib/database/users.repository';

async function getHandler(request: AuthenticatedRequest, clientId: string) {
  try {
    const user = request.user!;

    if (user.role !== 'terapist') {
      return NextResponse.json(
        { error: 'Bu islem sadece terapistler icin gecerlidir' },
        { status: 403 }
      );
    }

    // Verify that this client belongs to the therapist
    const client = await getUserById(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Danisan bulunamadi' },
        { status: 404 }
      );
    }

    const clientData: any = client;
    const connectedTherapistId = clientData.connectedTherapistId || clientData.CONNECTED_THERAPIST_ID;

    if (connectedTherapistId !== user.userId) {
      return NextResponse.json(
        { error: 'Bu danisanin verilerine erisim yetkiniz yok' },
        { status: 403 }
      );
    }

    // Fetch client's data in parallel
    const [journalResult, testResult, appointmentResult, taskResult, moodResult, gamificationResult] = await Promise.all([
      executeQuery(
        `SELECT entry_id as "entryId", content, prompt, is_shared as "isShared", created_at as "createdAt"
         FROM journal_entries WHERE user_id = :clientId AND is_shared = 1
         ORDER BY created_at DESC FETCH FIRST 20 ROWS ONLY`,
        { clientId }
      ),
      executeQuery(
        `SELECT submission_id as "submissionId", test_name as "testName", total_score as "totalScore",
                severity_level as "severityLevel", created_at as "createdAt"
         FROM test_submissions WHERE user_id = :clientId
         ORDER BY created_at DESC FETCH FIRST 20 ROWS ONLY`,
        { clientId }
      ),
      executeQuery(
        `SELECT appointment_id as "appointmentId", appointment_date as "appointmentDate",
                appointment_type as "appointmentType", duration_minutes as "durationMinutes",
                description, status, created_at as "createdAt"
         FROM appointments WHERE client_id = :clientId AND therapist_id = :therapistId
         ORDER BY appointment_date DESC FETCH FIRST 20 ROWS ONLY`,
        { clientId, therapistId: user.userId }
      ),
      executeQuery(
        `SELECT task_id as "taskId", title, description, task_type as "taskType",
                fields, status, created_at as "createdAt", updated_at as "updatedAt"
         FROM collaborative_tasks WHERE client_id = :clientId AND therapist_id = :therapistId
         ORDER BY created_at DESC FETCH FIRST 20 ROWS ONLY`,
        { clientId, therapistId: user.userId }
      ),
      executeQuery(
        `SELECT entry_id as "entryId", mood, period, notes, created_at as "createdAt"
         FROM mood_entries WHERE user_id = :clientId
         ORDER BY created_at DESC FETCH FIRST 30 ROWS ONLY`,
        { clientId }
      ),
      executeQuery(
        `SELECT xp, user_level as "level", current_streak as "currentStreak",
                longest_streak as "longestStreak", total_tasks_completed as "totalTasksCompleted"
         FROM gamification WHERE user_id = :clientId`,
        { clientId }
      ),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        client,
        journals: journalResult.rows || [],
        tests: testResult.rows || [],
        appointments: appointmentResult.rows || [],
        tasks: taskResult.rows || [],
        moods: moodResult.rows || [],
        gamification: gamificationResult.rows && gamificationResult.rows.length > 0
          ? gamificationResult.rows[0]
          : null,
      }
    });
  } catch (error) {
    console.error('Get client detail error:', error);
    return NextResponse.json(
      { error: 'Danisan verileri alinirken hata olustu' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  return authMiddleware(request, (req) => getHandler(req, clientId));
}
