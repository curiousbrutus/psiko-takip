import { OracleService } from '../oracle.service';
export interface GratitudeEntryRecord {
    entryId: string;
    userId: string;
    content: string;
    category: string | null;
    createdAt: string;
}
export declare class GratitudeRepository {
    private readonly oracleService;
    constructor(oracleService: OracleService);
    createEntry(entryId: string, userId: string, content: string, category?: string): Promise<void>;
    getEntries(userId: string): Promise<GratitudeEntryRecord[]>;
}
