import { Module } from '@nestjs/common';
import { MoodRepository } from '../database/repositories/mood.repository';
import { MoodController } from './mood.controller';
import { MoodService } from './mood.service';

@Module({
  providers: [MoodRepository, MoodService],
  controllers: [MoodController],
})
export class MoodModule {}
