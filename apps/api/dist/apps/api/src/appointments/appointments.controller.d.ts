import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
interface AuthRequest {
    user: {
        userId: string;
        role: string;
    };
}
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    create(req: AuthRequest, dto: CreateAppointmentDto): Promise<{
        success: boolean;
        data: {
            appointmentId: string;
        };
    }>;
    findAll(req: AuthRequest): Promise<{
        success: boolean;
        data: import("../database/repositories/appointments.repository").AppointmentRecord[];
    }>;
}
export {};
