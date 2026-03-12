import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

interface AuthRequest {
  user: {
    userId: string;
    role: string;
  };
}

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  async create(@Req() req: AuthRequest, @Body() dto: CreateAppointmentDto) {
    const data = await this.appointmentsService.create(req.user.userId, dto);
    return { success: true, data };
  }

  @Get()
  async findAll(@Req() req: AuthRequest) {
    const data = await this.appointmentsService.findAll(req.user);
    return { success: true, data };
  }
}
