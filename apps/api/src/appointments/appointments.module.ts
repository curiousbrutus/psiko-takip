import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AppointmentsRepository } from '../database/repositories/appointments.repository';

@Module({
  providers: [AppointmentsRepository, AppointmentsService],
  controllers: [AppointmentsController],
})
export class AppointmentsModule {}
