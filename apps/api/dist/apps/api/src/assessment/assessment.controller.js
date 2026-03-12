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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const assessment_service_1 = require("./assessment.service");
const create_assessment_result_dto_1 = require("./dto/create-assessment-result.dto");
const create_assessment_task_dto_1 = require("./dto/create-assessment-task.dto");
const get_assessment_query_dto_1 = require("./dto/get-assessment-query.dto");
let AssessmentController = class AssessmentController {
    constructor(assessmentService) {
        this.assessmentService = assessmentService;
    }
    async createTask(req, dto) {
        const data = await this.assessmentService.createTask(req.user.userId, dto);
        return { success: true, data };
    }
    async getTasks(req, query) {
        const data = await this.assessmentService.getTasks(req.user, query);
        return { success: true, data };
    }
    async getTaskById(req, taskId) {
        const data = await this.assessmentService.getTaskById(req.user, taskId);
        return { success: true, data };
    }
    async createResult(req, dto) {
        const data = await this.assessmentService.createResult(req.user.userId, dto);
        return { success: true, data };
    }
    async getResults(req, query) {
        const data = await this.assessmentService.getResults(req.user, query);
        return { success: true, data };
    }
};
exports.AssessmentController = AssessmentController;
__decorate([
    (0, common_1.Post)('assessment-tasks'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_assessment_task_dto_1.CreateAssessmentTaskDto]),
    __metadata("design:returntype", Promise)
], AssessmentController.prototype, "createTask", null);
__decorate([
    (0, common_1.Get)('assessment-tasks'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_assessment_query_dto_1.GetAssessmentQueryDto]),
    __metadata("design:returntype", Promise)
], AssessmentController.prototype, "getTasks", null);
__decorate([
    (0, common_1.Get)('assessment-tasks/:taskId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AssessmentController.prototype, "getTaskById", null);
__decorate([
    (0, common_1.Post)('assessment-results'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_assessment_result_dto_1.CreateAssessmentResultDto]),
    __metadata("design:returntype", Promise)
], AssessmentController.prototype, "createResult", null);
__decorate([
    (0, common_1.Get)('assessment-results'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_assessment_query_dto_1.GetAssessmentQueryDto]),
    __metadata("design:returntype", Promise)
], AssessmentController.prototype, "getResults", null);
exports.AssessmentController = AssessmentController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [assessment_service_1.AssessmentService])
], AssessmentController);
//# sourceMappingURL=assessment.controller.js.map