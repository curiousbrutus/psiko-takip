import { Injectable } from '@nestjs/common';
import { AppointmentsRepository } from '../database/repositories/appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly appointmentsRepository: AppointmentsRepository) {}

  async create(therapistId: string, dto: CreateAppointmentDto) {
    const appointmentId = `APT_${Date.now()}`;
    await this.appointmentsRepository.createAppointment({
      appointmentId,
      therapistId,
      clientId: dto.clientId,
      appointmentDate: dto.appointmentDate,
      appointmentType: dto.appointmentType || 'online',
      durationMinutes: dto.durationMinutes || 50,
      description: dto.description,
    });

    return { appointmentId };
  }

  async findAll(user: { userId: string; role: string }) {
    return this.appointmentsRepository.getAppointmentsForUser(user.userId, user.role);
  }
}
