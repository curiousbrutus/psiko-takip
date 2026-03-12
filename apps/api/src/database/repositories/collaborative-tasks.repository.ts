import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../oracle.service';

export interface CollaborativeTaskRecord {
  taskId: string;
  therapistId: string;
  clientId: string;
  title: string;
  description: string | null;
  taskType: string;
  fields: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  clientName?: string;
  therapistName?: string;
}

@Injectable()
export class CollaborativeTasksRepository {
  constructor(private readonly oracleService: OracleService) {}

  async createTask(input: {
    taskId: string;
    therapistId: string;
    clientId: string;
    title: string;
    description?: string;
    taskType?: string;
    fields?: unknown;
  }): Promise<void> {
    await this.oracleService.executeQuery(
      `INSERT INTO psk_ebg_collaborative_tasks
         (task_id, therapist_id, client_id, title, description, task_type, fields, status, created_at)
       VALUES
         (:taskId, :therapistId, :clientId, :title, :description, :taskType, :fields, 'pending', CURRENT_TIMESTAMP)`,
      {
        taskId: input.taskId,
        therapistId: input.therapistId,
        clientId: input.clientId,
        title: input.title,
        description: input.description || null,
        taskType: input.taskType || 'general',
        fields: input.fields ? JSON.stringify(input.fields) : null,
      },
      { autoCommit: true }
    );
  }

  async getTasks(user: { userId: string; role: string }, clientId?: string): Promise<CollaborativeTaskRecord[]> {
    let sql = `SELECT ct.task_id as "taskId", ct.therapist_id as "therapistId",
                      ct.client_id as "clientId", ct.title as "title", ct.description as "description",
                      ct.task_type as "taskType", ct.fields as "fields", ct.status as "status",
                      ct.created_at as "createdAt", ct.updated_at as "updatedAt",
                      u.display_name as "clientName"
               FROM psk_ebg_collaborative_tasks ct
               LEFT JOIN psk_ebg_users u ON ct.client_id = u.user_id
               WHERE 1=1`;
    const binds: BindParameters = {};

    if (user.role === 'terapist') {
      sql += ' AND ct.therapist_id = :therapistId';
      binds.therapistId = user.userId;
      if (clientId) {
        sql += ' AND ct.client_id = :clientId';
        binds.clientId = clientId;
      }
    } else {
      sql += ' AND ct.client_id = :clientId';
      binds.clientId = user.userId;
    }

    sql += ' ORDER BY ct.created_at DESC';

    const result = await this.oracleService.executeQuery<CollaborativeTaskRecord>(sql, binds);
    return result.rows || [];
  }

  async getTaskById(taskId: string): Promise<CollaborativeTaskRecord | null> {
    const result = await this.oracleService.executeQuery<CollaborativeTaskRecord>(
      `SELECT ct.task_id as "taskId", ct.therapist_id as "therapistId",
              ct.client_id as "clientId", ct.title as "title", ct.description as "description",
              ct.task_type as "taskType", ct.fields as "fields", ct.status as "status",
              ct.created_at as "createdAt", ct.updated_at as "updatedAt",
              u.display_name as "clientName",
              t.display_name as "therapistName"
       FROM psk_ebg_collaborative_tasks ct
       LEFT JOIN psk_ebg_users u ON ct.client_id = u.user_id
       LEFT JOIN psk_ebg_users t ON ct.therapist_id = t.user_id
       WHERE ct.task_id = :taskId`,
      { taskId }
    );

    return result.rows && result.rows.length > 0 ? result.rows[0] : null;
  }

  async updateTask(taskId: string, updates: { fields?: unknown; status?: string }): Promise<void> {
    const clauses: string[] = [];
    const binds: BindParameters = { taskId };

    if (updates.fields !== undefined) {
      clauses.push('fields = :fields');
      binds.fields = JSON.stringify(updates.fields);
    }

    if (updates.status !== undefined) {
      clauses.push('status = :status');
      binds.status = updates.status;
    }

    clauses.push('updated_at = CURRENT_TIMESTAMP');

    await this.oracleService.executeQuery(
      `UPDATE psk_ebg_collaborative_tasks
       SET ${clauses.join(', ')}
       WHERE task_id = :taskId`,
      binds,
      { autoCommit: true }
    );
  }
}
