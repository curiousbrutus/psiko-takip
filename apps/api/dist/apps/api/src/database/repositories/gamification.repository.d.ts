import { OracleService } from '../oracle.service';
export interface GamificationRecord {
    userId?: string;
    xp: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    companionType?: string | null;
    companionCreatedAt?: string | null;
    lastActivityDate?: string | null;
    totalTasksCompleted: number;
}
export declare class GamificationRepository {
    private readonly oracleService;
    constructor(oracleService: OracleService);
    getGamification(userId: string): Promise<GamificationRecord>;
    updateXp(userId: string, xp: number): Promise<void>;
    setCompanion(userId: string, companionType: string): Promise<void>;
}
