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
exports.TestSubmissionsRepository = void 0;
const common_1 = require("@nestjs/common");
const oracle_service_1 = require("../oracle.service");
let TestSubmissionsRepository = class TestSubmissionsRepository {
    constructor(oracleService) {
        this.oracleService = oracleService;
    }
    async createSubmission(input) {
        await this.oracleService.executeQuery(`INSERT INTO psk_ebg_test_submissions
         (submission_id, user_id, test_name, total_score, answers, severity_level)
       VALUES
         (:submissionId, :userId, :testName, :totalScore, :answers, :severityLevel)`, {
            submissionId: input.submissionId,
            userId: input.userId,
            testName: input.testName,
            totalScore: input.totalScore,
            answers: input.answers ? JSON.stringify(input.answers) : null,
            severityLevel: input.severityLevel || null,
        }, { autoCommit: true });
    }
    async getSubmissions(user, userId) {
        const targetUserId = userId && user.role === 'terapist' ? userId : user.userId;
        const result = await this.oracleService.executeQuery(`SELECT submission_id as "submissionId", user_id as "userId", test_name as "testName",
              total_score as "totalScore", answers as "answers",
              severity_level as "severityLevel", submitted_at as "createdAt"
       FROM psk_ebg_test_submissions
       WHERE user_id = :userId
       ORDER BY submitted_at DESC`, { userId: targetUserId });
        return result.rows || [];
    }
};
exports.TestSubmissionsRepository = TestSubmissionsRepository;
exports.TestSubmissionsRepository = TestSubmissionsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [oracle_service_1.OracleService])
], TestSubmissionsRepository);
//# sourceMappingURL=test-submissions.repository.js.map