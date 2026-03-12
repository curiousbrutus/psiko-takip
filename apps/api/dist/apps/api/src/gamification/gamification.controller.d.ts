import { UpdateGamificationDto } from './dto/update-gamification.dto';
import { GamificationService } from './gamification.service';
import { SetCompanionDto } from './dto/set-companion.dto';
interface AuthRequest {
    user: {
        userId: string;
    };
}
export declare class GamificationController {
    private readonly gamificationService;
    constructor(gamificationService: GamificationService);
    getCurrent(req: AuthRequest): Promise<{
        success: boolean;
        data: import("../database/repositories/gamification.repository").GamificationRecord;
    }>;
    update(req: AuthRequest, dto: UpdateGamificationDto): Promise<{
        success: boolean;
    }>;
    setCompanion(req: AuthRequest, dto: SetCompanionDto): Promise<{
        success: boolean;
    }>;
}
export {};
