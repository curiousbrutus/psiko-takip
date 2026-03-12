import { Injectable } from '@nestjs/common';
import { UserRole } from '@psikotakip/shared/types';
import { JournalRepository } from '../database/repositories/journal.repository';
import { CreateJournalDto } from './dto/create-journal.dto';
import { GetJournalQueryDto } from './dto/get-journal-query.dto';

@Injectable()
export class JournalService {
  constructor(private readonly journalRepository: JournalRepository) {}

  async create(userId: string, dto: CreateJournalDto) {
    const entryId = `JRN_${Date.now()}`;
    await this.journalRepository.createJournalEntry(
      entryId,
      userId,
      dto.content,
      dto.prompt,
      dto.isShared
    );

    return { entryId };
  }

  async findAll(currentUser: { userId: string; role: UserRole }, query: GetJournalQueryDto) {
    let targetUserId = currentUser.userId;

    if (query.userId && currentUser.role === 'terapist') {
      targetUserId = query.userId;
    }

    const isShared = query.isShared === 'true' ? true : query.isShared === 'false' ? false : null;

    return this.journalRepository.getJournalEntries(
      targetUserId,
      query.prompt,
      query.startDate,
      isShared
    );
  }
}
