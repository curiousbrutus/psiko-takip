import { GamificationRepository } from '../database/repositories/gamification.repository';
import { SetCompanionDto } from './dto/set-companion.dto';
import { UpdateGamificationDto } from './dto/update-gamification.dto';
export declare class GamificationService {
    private readonly gamificationRepository;
    constructor(gamificationRepository: GamificationRepository);
    getForUser(userId: string): Promise<import("../database/repositories/gamification.repository").GamificationRecord>;
    updateXp(userId: string, dto: UpdateGamificationDto): Promise<{
        success: boolean;
    }>;
    setCompanion(userId: string, dto: SetCompanionDto): Promise<{
        success: boolean;
    }>;
}
