import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../oracle.service';

export interface JournalEntryRecord {
  entryId: string;
  userId: string;
  content: string;
  prompt: string | null;
  isShared: number | boolean;
  createdAt: string;
}

@Injectable()
export class JournalRepository {
  constructor(private readonly oracleService: OracleService) {}

  async createJournalEntry(
    entryId: string,
    userId: string,
    content: string,
    prompt?: string,
    isShared?: boolean
  ): Promise<void> {
    await this.oracleService.executeQuery(
      `INSERT INTO psk_ebg_journal_entries (entry_id, user_id, content, prompt, is_shared, created_at)
       VALUES (:entryId, :userId, :content, :prompt, :isShared, CURRENT_TIMESTAMP)`,
      {
        entryId,
        userId,
        content,
        prompt: prompt || null,
        isShared: isShared ? 1 : 0,
      },
      { autoCommit: true }
    );
  }

  async getJournalEntries(
    userId: string,
    prompt?: string | null,
    startDate?: string | null,
    isShared?: boolean | null
  ): Promise<JournalEntryRecord[]> {
    let sql = `SELECT entry_id as "entryId", user_id as "userId", content,
                      prompt as "prompt", is_shared as "isShared",
                      created_at as "createdAt"
               FROM psk_ebg_journal_entries
               WHERE user_id = :userId`;

    const binds: BindParameters = { userId };

    if (prompt) {
      sql += ' AND prompt = :prompt';
      binds.prompt = prompt;
    }

    if (startDate) {
      sql += ` AND created_at >= TO_TIMESTAMP(:startDate, 'YYYY-MM-DD')`;
      binds.startDate = startDate;
    }

    if (isShared === true) {
      sql += ' AND is_shared = 1';
    }

    sql += ' ORDER BY created_at DESC';

    const result = await this.oracleService.executeQuery<JournalEntryRecord>(sql, binds);
    return result.rows || [];
  }
}
