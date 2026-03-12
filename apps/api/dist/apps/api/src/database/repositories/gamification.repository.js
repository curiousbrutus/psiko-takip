"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationRepository = void 0;
const common_1 = require("@nestjs/common");
const oracle_service_1 = require("../oracle.service");
let GamificationRepository = class GamificationRepository {
    constructor(oracleService) {
        this.oracleService = oracleService;
    }
    async getGamification(userId) {
        const result = await this.oracleService.executeQuery(`SELECT user_id as "userId", xp as "xp", user_level as "level",
              current_streak as "currentStreak", longest_streak as "longestStreak",
              companion_type as "companionType",
              companion_created_at as "companionCreatedAt",
              last_activity_date as "lastActivityDate",
              total_tasks_completed as "totalTasksCompleted"
       FROM psk_ebg_gamification
       WHERE user_id = :userId`, { userId });
        if (!result.rows || result.rows.length === 0) {
            return {
                userId,
                xp: 0,
                level: 1,
                currentStreak: 0,
                longestStreak: 0,
                companionType: null,
                companionCreatedAt: null,
                lastActivityDate: null,
                totalTasksCompleted: 0,
            };
        }
        return result.rows[0];
    }
    async updateXp(userId, xp) {
        const existing = await this.oracleService.executeQuery(`SELECT xp as "xp", user_level as "userLevel"
       FROM psk_ebg_gamification
       WHERE user_id = :userId`, { userId });
        if (!existing.rows || existing.rows.length === 0) {
            await this.oracleService.executeQuery(`INSERT INTO psk_ebg_gamification
           (user_id, xp, user_level, current_streak, longest_streak, last_activity_date, total_tasks_completed)
         VALUES (:userId, :xp, 1, 1, 1, CURRENT_TIMESTAMP, 1)`, { userId, xp: xp || 0 }, { autoCommit: true });
            return;
        }
        const currentXp = (existing.rows[0].xp || 0) + (xp || 0);
        const userLevel = Math.floor(currentXp / 100) + 1;
        await this.oracleService.executeQuery(`UPDATE psk_ebg_gamification
       SET xp = :xp,
           user_level = :userLevel,
           last_activity_date = CURRENT_TIMESTAMP,
           total_tasks_completed = total_tasks_completed + 1,
           current_streak = current_streak + 1,
           longest_streak = GREATEST(longest_streak, current_streak + 1)
       WHERE user_id = :userId`, { xp: currentXp, userLevel, userId }, { autoCommit: true });
    }
    async setCompanion(userId, companionType) {
        const existing = await this.oracleService.executeQuery(`SELECT user_id as "userId"
       FROM psk_ebg_gamification
       WHERE user_id = :userId`, { userId });
        if (!existing.rows || existing.rows.length === 0) {
            await this.oracleService.executeQuery(`INSERT INTO psk_ebg_gamification
           (user_id, xp, user_level, current_streak, companion_type, companion_created_at)
         VALUES (:userId, 0, 1, 0, :companionType, CURRENT_TIMESTAMP)`, { userId, companionType }, { autoCommit: true });
            return;
        }
        await this.oracleService.executeQuery(`UPDATE psk_ebg_gamification
       SET companion_type = :companionType,
           companion_created_at = CURRENT_TIMESTAMP
       WHERE user_id = :userId`, { companionType, userId }, { autoCommit: true });
    }
};
exports.GamificationRepository = GamificationRepository;
exports.GamificationRepository = GamificationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [oracle_service_1.OracleService])
], GamificationRepository);
//# sourceMappingURL=gamification.repository.js.map