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
exports.TestsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const create_test_submission_dto_1 = require("./dto/create-test-submission.dto");
const get_test_submissions_query_dto_1 = require("./dto/get-test-submissions-query.dto");
const tests_service_1 = require("./tests.service");
let TestsController = class TestsController {
    constructor(service) {
        this.service = service;
    }
    async create(req, dto) {
        const data = await this.service.create(req.user.userId, dto);
        return { success: true, data };
    }
    async findAll(req, query) {
        const data = await this.service.findAll(req.user, query);
        return { success: true, data };
    }
};
exports.TestsController = TestsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_test_submission_dto_1.CreateTestSubmissionDto]),
    __metadata("design:returntype", Promise)
], TestsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_test_submissions_query_dto_1.GetTestSubmissionsQueryDto]),
    __metadata("design:returntype", Promise)
], TestsController.prototype, "findAll", null);
exports.TestsController = TestsController = __decorate([
    (0, common_1.Controller)('test-submissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tests_service_1.TestsService])
], TestsController);
//# sourceMappingURL=tests.controller.js.map