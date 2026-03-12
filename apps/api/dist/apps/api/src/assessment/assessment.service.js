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
exports.AssessmentService = void 0;
const common_1 = require("@nestjs/common");
const assessment_repository_1 = require("../database/repositories/assessment.repository");
let AssessmentService = class AssessmentService {
    constructor(assessmentRepository) {
        this.assessmentRepository = assessmentRepository;
    }
    async createTask(therapistId, dto) {
        const taskId = `ATK_${Date.now()}`;
        await this.assessmentRepository.createTask({
            taskId,
            therapistId,
            clientId: dto.clientId,
            testName: dto.testName,
            dueDate: dto.dueDate,
            notes: dto.notes,
        });
        return { taskId };
    }
    async getTasks(user, query) {
        return this.assessmentRepository.getTasks(user, query.clientId);
    }
    async getTaskById(user, taskId) {
        const task = await this.assessmentRepository.getTaskById(taskId);
        if (!task) {
            throw new common_1.NotFoundException('Degerlendirme gorevi bulunamadi');
        }
        if (task.therapistId !== user.userId && task.clientId !== user.userId) {
            throw new common_1.ForbiddenException('Bu goreve erisim yetkiniz yok');
        }
        return task;
    }
    async createResult(userId, dto) {
        const resultId = `ARR_${Date.now()}`;
        await this.assessmentRepository.createResult({
            resultId,
            taskId: dto.taskId,
            userId,
            testName: dto.testName,
            totalScore: dto.totalScore,
            answers: dto.answers,
            severityLevel: dto.severityLevel,
        });
        return { resultId };
    }
    async getResults(user, query) {
        return this.assessmentRepository.getResults(user, query.clientId);
    }
};
exports.AssessmentService = AssessmentService;
exports.AssessmentService = AssessmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [assessment_repository_1.AssessmentRepository])
], AssessmentService);
//# sourceMappingURL=assessment.service.js.map