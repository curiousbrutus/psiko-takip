import { OracleService } from '../oracle.service';
export interface JournalEntryRecord {
    entryId: string;
    userId: string;
    content: string;
    prompt: string | null;
    isShared: number | boolean;
    createdAt: string;
}
export declare class JournalRepository {
    private readonly oracleService;
    constructor(oracleService: OracleService);
    createJournalEntry(entryId: string, userId: string, content: string, prompt?: string, isShared?: boolean): Promise<void>;
    getJournalEntries(userId: string, prompt?: string | null, startDate?: string | null, isShared?: boolean | null): Promise<JournalEntryRecord[]>;
}
