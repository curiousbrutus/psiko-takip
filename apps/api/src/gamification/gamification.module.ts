import { Module } from '@nestjs/common';
import { GamificationRepository } from '../database/repositories/gamification.repository';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';

@Module({
  providers: [GamificationRepository, GamificationService],
  controllers: [GamificationController],
})
export class GamificationModule {}
