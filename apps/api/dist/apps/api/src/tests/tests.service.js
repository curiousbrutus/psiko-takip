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
exports.TestsService = void 0;
const common_1 = require("@nestjs/common");
const test_submissions_repository_1 = require("../database/repositories/test-submissions.repository");
let TestsService = class TestsService {
    constructor(repository) {
        this.repository = repository;
    }
    async create(userId, dto) {
        const submissionId = `TST_${Date.now()}`;
        await this.repository.createSubmission({
            submissionId,
            userId,
            testName: dto.testName,
            totalScore: dto.totalScore,
            answers: dto.answers,
            severityLevel: dto.severityLevel,
        });
        return { submissionId };
    }
    async findAll(user, query) {
        return this.repository.getSubmissions(user, query.userId);
    }
};
exports.TestsService = TestsService;
exports.TestsService = TestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [test_submissions_repository_1.TestSubmissionsRepository])
], TestsService);
//# sourceMappingURL=tests.service.js.map