import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CollaborativeTasksService } from './collaborative-tasks.service';
import { CreateCollaborativeTaskDto } from './dto/create-collaborative-task.dto';
import { GetCollaborativeTasksQueryDto } from './dto/get-collaborative-tasks-query.dto';
import { UpdateCollaborativeTaskDto } from './dto/update-collaborative-task.dto';

interface AuthRequest {
  user: {
    userId: string;
    role: string;
  };
}

@Controller('collaborative-tasks')
@UseGuards(JwtAuthGuard)
export class CollaborativeTasksController {
  constructor(private readonly service: CollaborativeTasksService) {}

  @Post()
  async create(@Req() req: AuthRequest, @Body() dto: CreateCollaborativeTaskDto) {
    const data = await this.service.create(req.user.userId, dto);
    return { success: true, data };
  }

  @Get()
  async findAll(@Req() req: AuthRequest, @Query() query: GetCollaborativeTasksQueryDto) {
    const data = await this.service.findAll(req.user, query);
    return { success: true, data };
  }

  @Get(':taskId')
  async findOne(@Req() req: AuthRequest, @Param('taskId') taskId: string) {
    const data = await this.service.findOne(req.user, taskId);
    return { success: true, data };
  }

  @Put(':taskId')
  async update(
    @Req() req: AuthRequest,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateCollaborativeTaskDto
  ) {
    return this.service.update(req.user, taskId, dto);
  }
}
