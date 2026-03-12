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
exports.AppointmentsRepository = void 0;
const common_1 = require("@nestjs/common");
const oracle_service_1 = require("../oracle.service");
let AppointmentsRepository = class AppointmentsRepository {
    constructor(oracleService) {
        this.oracleService = oracleService;
    }
    async createAppointment(input) {
        await this.oracleService.executeQuery(`INSERT INTO psk_ebg_appointments
         (appointment_id, therapist_id, client_id, appointment_date, appointment_type, duration_minutes, description, status)
       VALUES
         (:appointmentId, :therapistId, :clientId,
          TO_TIMESTAMP(:appointmentDate, 'YYYY-MM-DD"T"HH24:MI:SS'),
          :appointmentType, :durationMinutes, :description, 'scheduled')`, {
            appointmentId: input.appointmentId,
            therapistId: input.therapistId,
            clientId: input.clientId,
            appointmentDate: input.appointmentDate,
            appointmentType: input.appointmentType,
            durationMinutes: input.durationMinutes,
            description: input.description || null,
        }, { autoCommit: true });
    }
    async getAppointmentsForUser(userId, role) {
        const sql = role === 'terapist'
            ? `SELECT a.appointment_id as "appointmentId", a.therapist_id as "therapistId",
                  a.client_id as "clientId", a.appointment_date as "appointmentDate",
                  a.appointment_type as "appointmentType", a.duration_minutes as "durationMinutes",
                  a.description as "description", a.status as "status", a.created_at as "createdAt",
                  u.display_name as "clientName", u.email as "clientEmail"
           FROM psk_ebg_appointments a
           LEFT JOIN psk_ebg_users u ON a.client_id = u.user_id
           WHERE a.therapist_id = :userId
           ORDER BY a.appointment_date DESC`
            : `SELECT a.appointment_id as "appointmentId", a.therapist_id as "therapistId",
                  a.client_id as "clientId", a.appointment_date as "appointmentDate",
                  a.appointment_type as "appointmentType", a.duration_minutes as "durationMinutes",
                  a.description as "description", a.status as "status", a.created_at as "createdAt",
                  u.display_name as "therapistName", u.email as "therapistEmail"
           FROM psk_ebg_appointments a
           LEFT JOIN psk_ebg_users u ON a.therapist_id = u.user_id
           WHERE a.client_id = :userId
           ORDER BY a.appointment_date DESC`;
        const result = await this.oracleService.executeQuery(sql, { userId });
        return result.rows || [];
    }
};
exports.AppointmentsRepository = AppointmentsRepository;
exports.AppointmentsRepository = AppointmentsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [oracle_service_1.OracleService])
], AppointmentsRepository);
//# sourceMappingURL=appointments.repository.js.map