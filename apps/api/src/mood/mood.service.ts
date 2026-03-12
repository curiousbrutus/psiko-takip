import { Injectable } from '@nestjs/common';
import { MoodRepository } from '../database/repositories/mood.repository';
import { CreateMoodDto } from './dto/create-mood.dto';
import { GetMoodQueryDto } from './dto/get-mood-query.dto';

@Injectable()
export class MoodService {
  constructor(private readonly moodRepository: MoodRepository) {}

  async create(userId: string, dto: CreateMoodDto) {
    const entryId = `MOD_${Date.now()}`;
    await this.moodRepository.createMoodEntry(
      entryId,
      userId,
      dto.mood,
      dto.period,
      dto.notes
    );

    return { entryId };
  }

  async findAll(userId: string, query: GetMoodQueryDto) {
    return this.moodRepository.getMoodEntries(userId, query.startDate);
  }
}
