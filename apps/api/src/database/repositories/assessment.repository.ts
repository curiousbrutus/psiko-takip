import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../oracle.service';

export interface AssessmentTaskRecord {
  taskId: string;
  therapistId: string;
  clientId: string;
  testName: string;
  dueDate: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  clientName?: string;
  therapistName?: string;
}

export interface AssessmentResultRecord {
  resultId: string;
  taskId: string | null;
  userId: string;
  testName: string;
  totalScore: number;
  answers: string | null;
  severityLevel: string | null;
  createdAt: string;
}

@Injectable()
export class AssessmentRepository {
  constructor(private readonly oracleService: OracleService) {}

  async createTask(input: {
    taskId: string;
    therapistId: string;
    clientId: string;
    testName: string;
    dueDate?: string;
    notes?: string;
  }): Promise<void> {
    await this.oracleService.executeQuery(
      `INSERT INTO psk_ebg_assessment_tasks
         (task_id, therapist_id, client_id, test_name, due_date, notes, status)
       VALUES
         (:taskId, :therapistId, :clientId, :testName,
          TO_TIMESTAMP(:dueDate, 'YYYY-MM-DD"T"HH24:MI:SS'), :notes, 'pending')`,
      {
        taskId: input.taskId,
        therapistId: input.therapistId,
        clientId: input.clientId,
        testName: input.testName,
        dueDate: input.dueDate || null,
        notes: input.notes || null,
      },
      { autoCommit: true }
    );
  }

  async getTasks(user: { userId: string; role: string }, clientId?: string): Promise<AssessmentTaskRecord[]> {
    let sql = `SELECT at2.task_id as "taskId", at2.therapist_id as "therapistId",
                      at2.client_id as "clientId", at2.test_name as "testName",
                      at2.due_date as "dueDate", at2.notes as "notes", at2.status as "status",
                      at2.assigned_at as "createdAt",
                      u.display_name as "clientName",
                      t.display_name as "therapistName"
               FROM psk_ebg_assessment_tasks at2
               LEFT JOIN psk_ebg_users u ON at2.client_id = u.user_id
               LEFT JOIN psk_ebg_users t ON at2.therapist_id = t.user_id
               WHERE 1=1`;

    const binds: BindParameters = {};

    if (user.role === 'terapist') {
      sql += ' AND at2.therapist_id = :therapistId';
      binds.therapistId = user.userId;
      if (clientId) {
        sql += ' AND at2.client_id = :clientId';
        binds.clientId = clientId;
      }
    } else {
      sql += ' AND at2.client_id = :clientId';
      binds.clientId = user.userId;
    }

    sql += ' ORDER BY at2.assigned_at DESC';

    const result = await this.oracleService.executeQuery<AssessmentTaskRecord>(sql, binds);
    return result.rows || [];
  }

  async getTaskById(taskId: string): Promise<AssessmentTaskRecord | null> {
    const result = await this.oracleService.executeQuery<AssessmentTaskRecord>(
      `SELECT at2.task_id as "taskId", at2.therapist_id as "therapistId",
              at2.client_id as "clientId", at2.test_name as "testName",
              at2.due_date as "dueDate", at2.notes as "notes", at2.status as "status",
              at2.assigned_at as "createdAt",
              u.display_name as "clientName",
              t.display_name as "therapistName"
       FROM psk_ebg_assessment_tasks at2
       LEFT JOIN psk_ebg_users u ON at2.client_id = u.user_id
       LEFT JOIN psk_ebg_users t ON at2.therapist_id = t.user_id
       WHERE at2.task_id = :taskId`,
      { taskId }
    );

    return result.rows && result.rows.length > 0 ? result.rows[0] : null;
  }

  async createResult(input: {
    resultId: string;
    taskId?: string;
    userId: string;
    testName: string;
    totalScore: number;
    answers?: unknown;
    severityLevel?: string;
  }): Promise<void> {
    await this.oracleService.executeQuery(
      `INSERT INTO psk_ebg_assessment_results
         (result_id, task_id, user_id, test_name, total_score, answers, severity_level, created_at)
       VALUES
         (:resultId, :taskId, :userId, :testName, :totalScore, :answers, :severityLevel, CURRENT_TIMESTAMP)`,
      {
        resultId: input.resultId,
        taskId: input.taskId || null,
        userId: input.userId,
        testName: input.testName,
        totalScore: input.totalScore,
        answers: input.answers ? JSON.stringify(input.answers) : null,
        severityLevel: input.severityLevel || null,
      },
      { autoCommit: true }
    );

    if (input.taskId) {
      await this.oracleService.executeQuery(
        `UPDATE psk_ebg_assessment_tasks SET status = 'completed' WHERE task_id = :taskId`,
        { taskId: input.taskId },
        { autoCommit: true }
      );
    }
  }

  async getResults(user: { userId: string; role: string }, clientId?: string): Promise<AssessmentResultRecord[]> {
    const targetUserId = clientId && user.role === 'terapist' ? clientId : user.userId;

    const result = await this.oracleService.executeQuery<AssessmentResultRecord>(
      `SELECT ar.result_id as "resultId", ar.task_id as "taskId", ar.user_id as "userId",
              ar.test_name as "testName", ar.total_score as "totalScore",
              ar.answers as "answers", ar.severity_level as "severityLevel",
              ar.created_at as "createdAt"
       FROM psk_ebg_assessment_results ar
       WHERE ar.user_id = :userId
       ORDER BY ar.created_at DESC`,
      { userId: targetUserId }
    );

    return result.rows || [];
  }
}
