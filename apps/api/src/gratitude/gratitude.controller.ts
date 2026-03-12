import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateGratitudeDto } from './dto/create-gratitude.dto';
import { GratitudeService } from './gratitude.service';

interface AuthRequest {
  user: {
    userId: string;
  };
}

@Controller('gratitude-entries')
@UseGuards(JwtAuthGuard)
export class GratitudeController {
  constructor(private readonly gratitudeService: GratitudeService) {}

  @Post()
  async create(@Req() req: AuthRequest, @Body() dto: CreateGratitudeDto) {
    const data = await this.gratitudeService.create(req.user.userId, dto);
    return { success: true, data };
  }

  @Get()
  async findAll(@Req() req: AuthRequest) {
    const data = await this.gratitudeService.findAll(req.user.userId);
    return { success: true, data };
  }
}
