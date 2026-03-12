import { AppointmentsRepository } from '../database/repositories/appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
export declare class AppointmentsService {
    private readonly appointmentsRepository;
    constructor(appointmentsRepository: AppointmentsRepository);
    create(therapistId: string, dto: CreateAppointmentDto): Promise<{
        appointmentId: string;
    }>;
    findAll(user: {
        userId: string;
        role: string;
    }): Promise<import("../database/repositories/appointments.repository").AppointmentRecord[]>;
}
