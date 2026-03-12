import { CreateJournalDto } from './dto/create-journal.dto';
import { GetJournalQueryDto } from './dto/get-journal-query.dto';
import { JournalService } from './journal.service';
interface AuthRequest {
    user: {
        userId: string;
        role: 'danisan' | 'terapist' | 'kurum_yoneticisi';
    };
}
export declare class JournalController {
    private readonly journalService;
    constructor(journalService: JournalService);
    create(req: AuthRequest, dto: CreateJournalDto): Promise<{
        success: boolean;
        data: {
            entryId: string;
        };
    }>;
    findAll(req: AuthRequest, query: GetJournalQueryDto): Promise<{
        success: boolean;
        data: import("../database/repositories/journal.repository").JournalEntryRecord[];
    }>;
}
export {};
