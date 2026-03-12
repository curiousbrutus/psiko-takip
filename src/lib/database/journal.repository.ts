/**
 * Journal Entries Repository
 *
 * Data access layer for journal entries
 */

import { executeQuery, generateId } from './config';

export interface JournalEntry {
  entryId: string;
  userId: string;
  content: string;
  prompt: string | null;
  isShared: boolean;
  createdAt: Date;
}

/**
 * Create a new journal entry
 */
export async function createJournalEntry(
  userId: string,
  content: string,
  prompt?: string,
  isShared?: boolean
): Promise<string> {
  const entryId = generateId('JRN');

  await executeQuery(
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

  return entryId;
}

/**
 * Get journal entries with optional filters
 */
export async function getJournalEntries(
  userId: string,
  prompt?: string | null,
  startDate?: string | null,
  isShared?: boolean | null
): Promise<JournalEntry[]> {
  let sql = `SELECT entry_id as "entryId", user_id as "userId", content, prompt,
                    is_shared as "isShared", created_at as "createdAt"
             FROM psk_ebg_journal_entries WHERE user_id = :userId`;
  const binds: any = { userId };

  if (prompt) {
    sql += ` AND prompt = :prompt`;
    binds.prompt = prompt;
  }

  if (startDate) {
    sql += ` AND created_at >= TO_TIMESTAMP(:startDate, 'YYYY-MM-DD')`;
    binds.startDate = startDate;
  }

  if (isShared) {
    sql += ` AND is_shared = 1`;
  }

  sql += ` ORDER BY created_at DESC`;

  const result = await executeQuery<JournalEntry>(sql, binds);

  return result.rows || [];
}

export default {
  createJournalEntry,
  getJournalEntries,
};
