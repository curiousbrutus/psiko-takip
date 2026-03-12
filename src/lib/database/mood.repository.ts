/**
 * Mood Entries Repository
 *
 * Data access layer for mood entries
 */

import { executeQuery, generateId } from './config';

export interface MoodEntry {
  entryId: string;
  userId: string;
  mood: string;
  period: string | null;
  notes: string | null;
  createdAt: Date;
}

/**
 * Create a new mood entry
 */
export async function createMoodEntry(
  userId: string,
  mood: string,
  period?: string,
  notes?: string
): Promise<string> {
  const entryId = generateId('MOD');

  await executeQuery(
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

  return entryId;
}

/**
 * Get mood entries for a user
 */
export async function getMoodEntries(
  userId: string,
  startDate?: string
): Promise<MoodEntry[]> {
  let sql = `SELECT entry_id as "entryId", user_id as "userId", mood, period, notes,
                    created_at as "createdAt"
             FROM psk_ebg_mood_entries WHERE user_id = :userId`;
  const binds: any = { userId };

  if (startDate) {
    sql += ` AND created_at >= TO_TIMESTAMP(:startDate, 'YYYY-MM-DD')`;
    binds.startDate = startDate;
  }

  sql += ` ORDER BY created_at DESC`;

  const result = await executeQuery<MoodEntry>(sql, binds);

  return result.rows || [];
}

export default {
  createMoodEntry,
  getMoodEntries,
};
