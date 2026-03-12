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
exports.JournalRepository = void 0;
const common_1 = require("@nestjs/common");
const oracle_service_1 = require("../oracle.service");
let JournalRepository = class JournalRepository {
    constructor(oracleService) {
        this.oracleService = oracleService;
    }
    async createJournalEntry(entryId, userId, content, prompt, isShared) {
        await this.oracleService.executeQuery(`INSERT INTO psk_ebg_journal_entries (entry_id, user_id, content, prompt, is_shared, created_at)
       VALUES (:entryId, :userId, :content, :prompt, :isShared, CURRENT_TIMESTAMP)`, {
            entryId,
            userId,
            content,
            prompt: prompt || null,
            isShared: isShared ? 1 : 0,
        }, { autoCommit: true });
    }
    async getJournalEntries(userId, prompt, startDate, isShared) {
        let sql = `SELECT entry_id as "entryId", user_id as "userId", content,
                      prompt as "prompt", is_shared as "isShared",
                      created_at as "createdAt"
               FROM psk_ebg_journal_entries
               WHERE user_id = :userId`;
        const binds = { userId };
        if (prompt) {
            sql += ' AND prompt = :prompt';
            binds.prompt = prompt;
        }
        if (startDate) {
            sql += ` AND created_at >= TO_TIMESTAMP(:startDate, 'YYYY-MM-DD')`;
            binds.startDate = startDate;
        }
        if (isShared === true) {
            sql += ' AND is_shared = 1';
        }
        sql += ' ORDER BY created_at DESC';
        const result = await this.oracleService.executeQuery(sql, binds);
        return result.rows || [];
    }
};
exports.JournalRepository = JournalRepository;
exports.JournalRepository = JournalRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [oracle_service_1.OracleService])
], JournalRepository);
//# sourceMappingURL=journal.repository.js.map