import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AssessmentService } from './assessment.service';
import { CreateAssessmentResultDto } from './dto/create-assessment-result.dto';
import { CreateAssessmentTaskDto } from './dto/create-assessment-task.dto';
import { GetAssessmentQueryDto } from './dto/get-assessment-query.dto';

interface AuthRequest {
  user: {
    userId: string;
    role: string;
  };
}

@Controller()
@UseGuards(JwtAuthGuard)
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post('assessment-tasks')
  async createTask(@Req() req: AuthRequest, @Body() dto: CreateAssessmentTaskDto) {
    const data = await this.assessmentService.createTask(req.user.userId, dto);
    return { success: true, data };
  }

  @Get('assessment-tasks')
  async getTasks(@Req() req: AuthRequest, @Query() query: GetAssessmentQueryDto) {
    const data = await this.assessmentService.getTasks(req.user, query);
    return { success: true, data };
  }

  @Get('assessment-tasks/:taskId')
  async getTaskById(@Req() req: AuthRequest, @Param('taskId') taskId: string) {
    const data = await this.assessmentService.getTaskById(req.user, taskId);
    return { success: true, data };
  }

  @Post('assessment-results')
  async createResult(@Req() req: AuthRequest, @Body() dto: CreateAssessmentResultDto) {
    const data = await this.assessmentService.createResult(req.user.userId, dto);
    return { success: true, data };
  }

  @Get('assessment-results')
  async getResults(@Req() req: AuthRequest, @Query() query: GetAssessmentQueryDto) {
    const data = await this.assessmentService.getResults(req.user, query);
    return { success: true, data };
  }
}
