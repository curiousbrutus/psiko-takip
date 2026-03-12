import { Injectable } from '@nestjs/common';
import { OracleService } from '../oracle.service';

export interface TestSubmissionRecord {
  submissionId: string;
  userId: string;
  testName: string;
  totalScore: number;
  answers: string | null;
  severityLevel: string | null;
  createdAt: string;
}

@Injectable()
export class TestSubmissionsRepository {
  constructor(private readonly oracleService: OracleService) {}

  async createSubmission(input: {
    submissionId: string;
    userId: string;
    testName: string;
    totalScore: number;
    answers?: unknown;
    severityLevel?: string;
  }): Promise<void> {
    await this.oracleService.executeQuery(
      `INSERT INTO psk_ebg_test_submissions
         (submission_id, user_id, test_name, total_score, answers, severity_level)
       VALUES
         (:submissionId, :userId, :testName, :totalScore, :answers, :severityLevel)`,
      {
        submissionId: input.submissionId,
        userId: input.userId,
        testName: input.testName,
        totalScore: input.totalScore,
        answers: input.answers ? JSON.stringify(input.answers) : null,
        severityLevel: input.severityLevel || null,
      },
      { autoCommit: true }
    );
  }

  async getSubmissions(user: { userId: string; role: string }, userId?: string): Promise<TestSubmissionRecord[]> {
    const targetUserId = userId && user.role === 'terapist' ? userId : user.userId;

    const result = await this.oracleService.executeQuery<TestSubmissionRecord>(
      `SELECT submission_id as "submissionId", user_id as "userId", test_name as "testName",
              total_score as "totalScore", answers as "answers",
              severity_level as "severityLevel", submitted_at as "createdAt"
       FROM psk_ebg_test_submissions
       WHERE user_id = :userId
       ORDER BY submitted_at DESC`,
      { userId: targetUserId }
    );

    return result.rows || [];
  }
}
