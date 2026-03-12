import { Injectable } from '@nestjs/common';
import { OracleService } from '../oracle.service';

export interface GratitudeEntryRecord {
  entryId: string;
  userId: string;
  content: string;
  category: string | null;
  createdAt: string;
}

@Injectable()
export class GratitudeRepository {
  constructor(private readonly oracleService: OracleService) {}

  async createEntry(
    entryId: string,
    userId: string,
    content: string,
    category?: string
  ): Promise<void> {
    await this.oracleService.executeQuery(
      `INSERT INTO psk_ebg_gratitude_entries (entry_id, user_id, content, category, created_at)
       VALUES (:entryId, :userId, :content, :category, CURRENT_TIMESTAMP)`,
      {
        entryId,
        userId,
        content,
        category: category || null,
      },
      { autoCommit: true }
    );
  }

  async getEntries(userId: string): Promise<GratitudeEntryRecord[]> {
    const result = await this.oracleService.executeQuery<GratitudeEntryRecord>(
      `SELECT entry_id as "entryId", user_id as "userId", content,
              category as "category", created_at as "createdAt"
       FROM psk_ebg_gratitude_entries
       WHERE user_id = :userId
       ORDER BY created_at DESC`,
      { userId }
    );

    return result.rows || [];
  }
}
