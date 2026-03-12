import { Injectable } from '@nestjs/common';
import { OracleService } from '../oracle.service';

export interface AppointmentRecord {
  appointmentId: string;
  therapistId: string;
  clientId: string;
  appointmentDate: string;
  appointmentType: string;
  durationMinutes: number;
  description: string | null;
  status: string;
  createdAt: string;
  clientName?: string;
  clientEmail?: string;
  therapistName?: string;
  therapistEmail?: string;
}

@Injectable()
export class AppointmentsRepository {
  constructor(private readonly oracleService: OracleService) {}

  async createAppointment(input: {
    appointmentId: string;
    therapistId: string;
    clientId: string;
    appointmentDate: string;
    appointmentType: string;
    durationMinutes: number;
    description?: string;
  }): Promise<void> {
    await this.oracleService.executeQuery(
      `INSERT INTO psk_ebg_appointments
         (appointment_id, therapist_id, client_id, appointment_date, appointment_type, duration_minutes, description, status)
       VALUES
         (:appointmentId, :therapistId, :clientId,
          TO_TIMESTAMP(:appointmentDate, 'YYYY-MM-DD"T"HH24:MI:SS'),
          :appointmentType, :durationMinutes, :description, 'scheduled')`,
      {
        appointmentId: input.appointmentId,
        therapistId: input.therapistId,
        clientId: input.clientId,
        appointmentDate: input.appointmentDate,
        appointmentType: input.appointmentType,
        durationMinutes: input.durationMinutes,
        description: input.description || null,
      },
      { autoCommit: true }
    );
  }

  async getAppointmentsForUser(userId: string, role: string): Promise<AppointmentRecord[]> {
    const sql =
      role === 'terapist'
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

    const result = await this.oracleService.executeQuery<AppointmentRecord>(sql, { userId });
    return result.rows || [];
  }
}
