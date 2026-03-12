import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTestSubmissionDto } from './dto/create-test-submission.dto';
import { GetTestSubmissionsQueryDto } from './dto/get-test-submissions-query.dto';
import { TestsService } from './tests.service';

interface AuthRequest {
  user: {
    userId: string;
    role: string;
  };
}

@Controller('test-submissions')
@UseGuards(JwtAuthGuard)
export class TestsController {
  constructor(private readonly service: TestsService) {}

  @Post()
  async create(@Req() req: AuthRequest, @Body() dto: CreateTestSubmissionDto) {
    const data = await this.service.create(req.user.userId, dto);
    return { success: true, data };
  }

  @Get()
  async findAll(@Req() req: AuthRequest, @Query() query: GetTestSubmissionsQueryDto) {
    const data = await this.service.findAll(req.user, query);
    return { success: true, data };
  }
}
