import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMoodDto } from './dto/create-mood.dto';
import { GetMoodQueryDto } from './dto/get-mood-query.dto';
import { MoodService } from './mood.service';

interface AuthRequest {
  user: {
    userId: string;
  };
}

@Controller('mood-entries')
@UseGuards(JwtAuthGuard)
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  @Post()
  async create(@Req() req: AuthRequest, @Body() dto: CreateMoodDto) {
    const data = await this.moodService.create(req.user.userId, dto);
    return { success: true, data };
  }

  @Get()
  async findAll(@Req() req: AuthRequest, @Query() query: GetMoodQueryDto) {
    const data = await this.moodService.findAll(req.user.userId, query);
    return { success: true, data };
  }
}
