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
export declare class AppointmentsRepository {
    private readonly oracleService;
    constructor(oracleService: OracleService);
    createAppointment(input: {
        appointmentId: string;
        therapistId: string;
        clientId: string;
        appointmentDate: string;
        appointmentType: string;
        durationMinutes: number;
        description?: string;
    }): Promise<void>;
    getAppointmentsForUser(userId: string, role: string): Promise<AppointmentRecord[]>;
}
