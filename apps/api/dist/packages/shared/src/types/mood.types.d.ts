export type MoodPeriod = 'morning' | 'evening';
export interface MoodEntry {
    moodEntryId: string;
    userId: string;
    moodScore: number;
    moodPeriod: MoodPeriod;
    notes?: string;
    entryDate: string;
    createdAt?: string;
}
