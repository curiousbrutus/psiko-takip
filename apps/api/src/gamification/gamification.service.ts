import { Injectable } from '@nestjs/common';
import { GamificationRepository } from '../database/repositories/gamification.repository';
import { SetCompanionDto } from './dto/set-companion.dto';
import { UpdateGamificationDto } from './dto/update-gamification.dto';

@Injectable()
export class GamificationService {
  constructor(private readonly gamificationRepository: GamificationRepository) {}

  async getForUser(userId: string) {
    return this.gamificationRepository.getGamification(userId);
  }

  async updateXp(userId: string, dto: UpdateGamificationDto) {
    await this.gamificationRepository.updateXp(userId, dto.xp);
    return { success: true };
  }

  async setCompanion(userId: string, dto: SetCompanionDto) {
    await this.gamificationRepository.setCompanion(userId, dto.companionType);
    return { success: true };
  }
}
