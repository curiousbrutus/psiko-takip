export interface Companion {
    name: string;
    level: number;
    mood?: string;
    avatarUrl?: string;
}
export interface GamificationData {
    userId: string;
    xp: number;
    level: number;
    currentStreak: number;
    longestStreak?: number;
    companion?: Companion;
    updatedAt?: string;
}
