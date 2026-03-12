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
exports.AssessmentRepository = void 0;
const common_1 = require("@nestjs/common");
const oracle_service_1 = require("../oracle.service");
let AssessmentRepository = class AssessmentRepository {
    constructor(oracleService) {
        this.oracleService = oracleService;
    }
    async createTask(input) {
        await this.oracleService.executeQuery(`INSERT INTO psk_ebg_assessment_tasks
         (task_id, therapist_id, client_id, test_name, due_date, notes, status)
       VALUES
         (:taskId, :therapistId, :clientId, :testName,
          TO_TIMESTAMP(:dueDate, 'YYYY-MM-DD"T"HH24:MI:SS'), :notes, 'pending')`, {
            taskId: input.taskId,
            therapistId: input.therapistId,
            clientId: input.clientId,
            testName: input.testName,
            dueDate: input.dueDate || null,
            notes: input.notes || null,
        }, { autoCommit: true });
    }
    async getTasks(user, clientId) {
        let sql = `SELECT at2.task_id as "taskId", at2.therapist_id as "therapistId",
                      at2.client_id as "clientId", at2.test_name as "testName",
                      at2.due_date as "dueDate", at2.notes as "notes", at2.status as "status",
                      at2.assigned_at as "createdAt",
                      u.display_name as "clientName",
                      t.display_name as "therapistName"
               FROM psk_ebg_assessment_tasks at2
               LEFT JOIN psk_ebg_users u ON at2.client_id = u.user_id
               LEFT JOIN psk_ebg_users t ON at2.therapist_id = t.user_id
               WHERE 1=1`;
        const binds = {};
        if (user.role === 'terapist') {
            sql += ' AND at2.therapist_id = :therapistId';
            binds.therapistId = user.userId;
            if (clientId) {
                sql += ' AND at2.client_id = :clientId';
                binds.clientId = clientId;
            }
        }
        else {
            sql += ' AND at2.client_id = :clientId';
            binds.clientId = user.userId;
        }
        sql += ' ORDER BY at2.assigned_at DESC';
        const result = await this.oracleService.executeQuery(sql, binds);
        return result.rows || [];
    }
    async getTaskById(taskId) {
        const result = await this.oracleService.executeQuery(`SELECT at2.task_id as "taskId", at2.therapist_id as "therapistId",
              at2.client_id as "clientId", at2.test_name as "testName",
              at2.due_date as "dueDate", at2.notes as "notes", at2.status as "status",
              at2.assigned_at as "createdAt",
              u.display_name as "clientName",
              t.display_name as "therapistName"
       FROM psk_ebg_assessment_tasks at2
       LEFT JOIN psk_ebg_users u ON at2.client_id = u.user_id
       LEFT JOIN psk_ebg_users t ON at2.therapist_id = t.user_id
       WHERE at2.task_id = :taskId`, { taskId });
        return result.rows && result.rows.length > 0 ? result.rows[0] : null;
    }
    async createResult(input) {
        await this.oracleService.executeQuery(`INSERT INTO psk_ebg_assessment_results
         (result_id, task_id, user_id, test_name, total_score, answers, severity_level, created_at)
       VALUES
         (:resultId, :taskId, :userId, :testName, :totalScore, :answers, :severityLevel, CURRENT_TIMESTAMP)`, {
            resultId: input.resultId,
            taskId: input.taskId || null,
            userId: input.userId,
            testName: input.testName,
            totalScore: input.totalScore,
            answers: input.answers ? JSON.stringify(input.answers) : null,
            severityLevel: input.severityLevel || null,
        }, { autoCommit: true });
        if (input.taskId) {
            await this.oracleService.executeQuery(`UPDATE psk_ebg_assessment_tasks SET status = 'completed' WHERE task_id = :taskId`, { taskId: input.taskId }, { autoCommit: true });
        }
    }
    async getResults(user, clientId) {
        const targetUserId = clientId && user.role === 'terapist' ? clientId : user.userId;
        const result = await this.oracleService.executeQuery(`SELECT ar.result_id as "resultId", ar.task_id as "taskId", ar.user_id as "userId",
              ar.test_name as "testName", ar.total_score as "totalScore",
              ar.answers as "answers", ar.severity_level as "severityLevel",
              ar.created_at as "createdAt"
       FROM psk_ebg_assessment_results ar
       WHERE ar.user_id = :userId
       ORDER BY ar.created_at DESC`, { userId: targetUserId });
        return result.rows || [];
    }
};
exports.AssessmentRepository = AssessmentRepository;
exports.AssessmentRepository = AssessmentRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [oracle_service_1.OracleService])
], AssessmentRepository);
//# sourceMappingURL=assessment.repository.js.map