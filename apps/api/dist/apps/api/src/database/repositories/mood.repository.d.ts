import { OracleService } from '../oracle.service';
export interface MoodEntryRecord {
    entryId: string;
    userId: string;
    mood: string;
    period: string | null;
    notes: string | null;
    createdAt: string;
}
export declare class MoodRepository {
    private readonly oracleService;
    constructor(oracleService: OracleService);
    createMoodEntry(entryId: string, userId: string, mood: string, period?: string, notes?: string): Promise<void>;
    getMoodEntries(userId: string, startDate?: string): Promise<MoodEntryRecord[]>;
}
