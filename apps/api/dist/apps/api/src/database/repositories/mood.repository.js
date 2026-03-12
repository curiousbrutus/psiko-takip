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
exports.MoodRepository = void 0;
const common_1 = require("@nestjs/common");
const oracle_service_1 = require("../oracle.service");
let MoodRepository = class MoodRepository {
    constructor(oracleService) {
        this.oracleService = oracleService;
    }
    async createMoodEntry(entryId, userId, mood, period, notes) {
        await this.oracleService.executeQuery(`INSERT INTO psk_ebg_mood_entries (entry_id, user_id, mood, period, notes, created_at)
       VALUES (:entryId, :userId, :mood, :period, :notes, CURRENT_TIMESTAMP)`, {
            entryId,
            userId,
            mood,
            period: period || null,
            notes: notes || null,
        }, { autoCommit: true });
    }
    async getMoodEntries(userId, startDate) {
        let sql = `SELECT entry_id as "entryId", user_id as "userId", mood,
                      period as "period", notes as "notes",
                      created_at as "createdAt"
               FROM psk_ebg_mood_entries
               WHERE user_id = :userId`;
        const binds = { userId };
        if (startDate) {
            sql += ` AND created_at >= TO_TIMESTAMP(:startDate, 'YYYY-MM-DD')`;
            binds.startDate = startDate;
        }
        sql += ' ORDER BY created_at DESC';
        const result = await this.oracleService.executeQuery(sql, binds);
        return result.rows || [];
    }
};
exports.MoodRepository = MoodRepository;
exports.MoodRepository = MoodRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [oracle_service_1.OracleService])
], MoodRepository);
//# sourceMappingURL=mood.repository.js.map