import { UserRole } from '@psikotakip/shared/types';
import { JournalRepository } from '../database/repositories/journal.repository';
import { CreateJournalDto } from './dto/create-journal.dto';
import { GetJournalQueryDto } from './dto/get-journal-query.dto';
export declare class JournalService {
    private readonly journalRepository;
    constructor(journalRepository: JournalRepository);
    create(userId: string, dto: CreateJournalDto): Promise<{
        entryId: string;
    }>;
    findAll(currentUser: {
        userId: string;
        role: UserRole;
    }, query: GetJournalQueryDto): Promise<import("../database/repositories/journal.repository").JournalEntryRecord[]>;
}
