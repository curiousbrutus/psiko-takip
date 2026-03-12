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
exports.CollaborativeTasksRepository = void 0;
const common_1 = require("@nestjs/common");
const oracle_service_1 = require("../oracle.service");
let CollaborativeTasksRepository = class CollaborativeTasksRepository {
    constructor(oracleService) {
        this.oracleService = oracleService;
    }
    async createTask(input) {
        await this.oracleService.executeQuery(`INSERT INTO psk_ebg_collaborative_tasks
         (task_id, therapist_id, client_id, title, description, task_type, fields, status, created_at)
       VALUES
         (:taskId, :therapistId, :clientId, :title, :description, :taskType, :fields, 'pending', CURRENT_TIMESTAMP)`, {
            taskId: input.taskId,
            therapistId: input.therapistId,
            clientId: input.clientId,
            title: input.title,
            description: input.description || null,
            taskType: input.taskType || 'general',
            fields: input.fields ? JSON.stringify(input.fields) : null,
        }, { autoCommit: true });
    }
    async getTasks(user, clientId) {
        let sql = `SELECT ct.task_id as "taskId", ct.therapist_id as "therapistId",
                      ct.client_id as "clientId", ct.title as "title", ct.description as "description",
                      ct.task_type as "taskType", ct.fields as "fields", ct.status as "status",
                      ct.created_at as "createdAt", ct.updated_at as "updatedAt",
                      u.display_name as "clientName"
               FROM psk_ebg_collaborative_tasks ct
               LEFT JOIN psk_ebg_users u ON ct.client_id = u.user_id
               WHERE 1=1`;
        const binds = {};
        if (user.role === 'terapist') {
            sql += ' AND ct.therapist_id = :therapistId';
            binds.therapistId = user.userId;
            if (clientId) {
                sql += ' AND ct.client_id = :clientId';
                binds.clientId = clientId;
            }
        }
        else {
            sql += ' AND ct.client_id = :clientId';
            binds.clientId = user.userId;
        }
        sql += ' ORDER BY ct.created_at DESC';
        const result = await this.oracleService.executeQuery(sql, binds);
        return result.rows || [];
    }
    async getTaskById(taskId) {
        const result = await this.oracleService.executeQuery(`SELECT ct.task_id as "taskId", ct.therapist_id as "therapistId",
              ct.client_id as "clientId", ct.title as "title", ct.description as "description",
              ct.task_type as "taskType", ct.fields as "fields", ct.status as "status",
              ct.created_at as "createdAt", ct.updated_at as "updatedAt",
              u.display_name as "clientName",
              t.display_name as "therapistName"
       FROM psk_ebg_collaborative_tasks ct
       LEFT JOIN psk_ebg_users u ON ct.client_id = u.user_id
       LEFT JOIN psk_ebg_users t ON ct.therapist_id = t.user_id
       WHERE ct.task_id = :taskId`, { taskId });
        return result.rows && result.rows.length > 0 ? result.rows[0] : null;
    }
    async updateTask(taskId, updates) {
        const clauses = [];
        const binds = { taskId };
        if (updates.fields !== undefined) {
            clauses.push('fields = :fields');
            binds.fields = JSON.stringify(updates.fields);
        }
        if (updates.status !== undefined) {
            clauses.push('status = :status');
            binds.status = updates.status;
        }
        clauses.push('updated_at = CURRENT_TIMESTAMP');
        await this.oracleService.executeQuery(`UPDATE psk_ebg_collaborative_tasks
       SET ${clauses.join(', ')}
       WHERE task_id = :taskId`, binds, { autoCommit: true });
    }
};
exports.CollaborativeTasksRepository = CollaborativeTasksRepository;
exports.CollaborativeTasksRepository = CollaborativeTasksRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [oracle_service_1.OracleService])
], CollaborativeTasksRepository);
//# sourceMappingURL=collaborative-tasks.repository.js.map