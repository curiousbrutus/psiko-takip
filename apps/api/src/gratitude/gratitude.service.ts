import { Injectable } from '@nestjs/common';
import { GratitudeRepository } from '../database/repositories/gratitude.repository';
import { CreateGratitudeDto } from './dto/create-gratitude.dto';

@Injectable()
export class GratitudeService {
  constructor(private readonly gratitudeRepository: GratitudeRepository) {}

  async create(userId: string, dto: CreateGratitudeDto) {
    const entryId = `GRT_${Date.now()}`;
    await this.gratitudeRepository.createEntry(entryId, userId, dto.content, dto.category);
    return { entryId };
  }

  async findAll(userId: string) {
    return this.gratitudeRepository.getEntries(userId);
  }
}
