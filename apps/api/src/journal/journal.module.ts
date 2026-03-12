import { Module } from '@nestjs/common';
import { JournalRepository } from '../database/repositories/journal.repository';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';

@Module({
  providers: [JournalRepository, JournalService],
  controllers: [JournalController],
})
export class JournalModule {}
