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
exports.CollaborativeTasksService = void 0;
const common_1 = require("@nestjs/common");
const collaborative_tasks_repository_1 = require("../database/repositories/collaborative-tasks.repository");
let CollaborativeTasksService = class CollaborativeTasksService {
    constructor(repository) {
        this.repository = repository;
    }
    async create(therapistId, dto) {
        const taskId = `CTK_${Date.now()}`;
        await this.repository.createTask({
            taskId,
            therapistId,
            clientId: dto.clientId,
            title: dto.title,
            description: dto.description,
            taskType: dto.taskType,
            fields: dto.fields,
        });
        return { taskId };
    }
    async findAll(user, query) {
        return this.repository.getTasks(user, query.clientId);
    }
    async findOne(user, taskId) {
        const task = await this.repository.getTaskById(taskId);
        if (!task) {
            throw new common_1.NotFoundException('Gorev bulunamadi');
        }
        if (task.therapistId !== user.userId && task.clientId !== user.userId) {
            throw new common_1.ForbiddenException('Bu goreve erisim yetkiniz yok');
        }
        return task;
    }
    async update(user, taskId, dto) {
        const task = await this.repository.getTaskById(taskId);
        if (!task) {
            throw new common_1.NotFoundException('Gorev bulunamadi');
        }
        if (task.therapistId !== user.userId && task.clientId !== user.userId) {
            throw new common_1.ForbiddenException('Bu gorevi guncelleme yetkiniz yok');
        }
        await this.repository.updateTask(taskId, dto);
        return { success: true };
    }
};
exports.CollaborativeTasksService = CollaborativeTasksService;
exports.CollaborativeTasksService = CollaborativeTasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [collaborative_tasks_repository_1.CollaborativeTasksRepository])
], CollaborativeTasksService);
//# sourceMappingURL=collaborative-tasks.service.js.map