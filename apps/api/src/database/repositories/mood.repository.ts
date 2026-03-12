import { Injectable } from '@nestjs/common';
import type { BindParameters } from 'oracledb';
import { OracleService } from '../oracle.service';

export interface MoodEntryRecord {
  entryId: string;
  userId: string;
  mood: string;
  period: string | null;
  notes: string | null;
  createdAt: string;
}

@Injectable()
export class MoodRepository {
  constructor(private readonly oracleService: OracleService) {}

  async createMoodEntry(
    entryId: string,
    userId: string,
    mood: string,
    period?: string,
    notes?: string
  ): Promise<void> {
    await this.oracleService.executeQuery(
      `INSERT INTO psk_ebg_mood_entries (entry_id, user_id, mood, period, notes, created_at)
       VALUES (:entryId, :userId, :mood, :period, :notes, CURRENT_TIMESTAMP)`,
      {
        entryId,
        userId,
        mood,
        period: period || null,
        notes: notes || null,
      },
      { autoCommit: true }
    );
  }

  async getMoodEntries(userId: string, startDate?: string): Promise<MoodEntryRecord[]> {
    let sql = `SELECT entry_id as "entryId", user_id as "userId", mood,
                      period as "period", notes as "notes",
                      created_at as "createdAt"
               FROM psk_ebg_mood_entries
               WHERE user_id = :userId`;

    const binds: BindParameters = { userId };

    if (startDate) {
      sql += ` AND created_at >= TO_TIMESTAMP(:startDate, 'YYYY-MM-DD')`;
      binds.startDate = startDate;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await this.oracleService.executeQuery<MoodEntryRecord>(sql, binds);
    return result.rows || [];
  }
}
