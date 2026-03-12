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
exports.CollaborativeTasksController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const collaborative_tasks_service_1 = require("./collaborative-tasks.service");
const create_collaborative_task_dto_1 = require("./dto/create-collaborative-task.dto");
const get_collaborative_tasks_query_dto_1 = require("./dto/get-collaborative-tasks-query.dto");
const update_collaborative_task_dto_1 = require("./dto/update-collaborative-task.dto");
let CollaborativeTasksController = class CollaborativeTasksController {
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
    async findOne(req, taskId) {
        const data = await this.service.findOne(req.user, taskId);
        return { success: true, data };
    }
    async update(req, taskId, dto) {
        return this.service.update(req.user, taskId, dto);
    }
};
exports.CollaborativeTasksController = CollaborativeTasksController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_collaborative_task_dto_1.CreateCollaborativeTaskDto]),
    __metadata("design:returntype", Promise)
], CollaborativeTasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_collaborative_tasks_query_dto_1.GetCollaborativeTasksQueryDto]),
    __metadata("design:returntype", Promise)
], CollaborativeTasksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':taskId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CollaborativeTasksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':taskId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_collaborative_task_dto_1.UpdateCollaborativeTaskDto]),
    __metadata("design:returntype", Promise)
], CollaborativeTasksController.prototype, "update", null);
exports.CollaborativeTasksController = CollaborativeTasksController = __decorate([
    (0, common_1.Controller)('collaborative-tasks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [collaborative_tasks_service_1.CollaborativeTasksService])
], CollaborativeTasksController);
//# sourceMappingURL=collaborative-tasks.controller.js.map