import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateJournalDto } from './dto/create-journal.dto';
import { GetJournalQueryDto } from './dto/get-journal-query.dto';
import { JournalService } from './journal.service';

interface AuthRequest {
  user: {
    userId: string;
    role: 'danisan' | 'terapist' | 'kurum_yoneticisi';
  };
}

@Controller('journal-entries')
@UseGuards(JwtAuthGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  async create(@Req() req: AuthRequest, @Body() dto: CreateJournalDto) {
    const data = await this.journalService.create(req.user.userId, dto);
    return { success: true, data };
  }

  @Get()
  async findAll(@Req() req: AuthRequest, @Query() query: GetJournalQueryDto) {
    const data = await this.journalService.findAll(req.user, query);
    return { success: true, data };
  }
}
