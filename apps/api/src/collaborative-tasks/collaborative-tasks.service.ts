import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CollaborativeTasksRepository } from '../database/repositories/collaborative-tasks.repository';
import { CreateCollaborativeTaskDto } from './dto/create-collaborative-task.dto';
import { GetCollaborativeTasksQueryDto } from './dto/get-collaborative-tasks-query.dto';
import { UpdateCollaborativeTaskDto } from './dto/update-collaborative-task.dto';

@Injectable()
export class CollaborativeTasksService {
  constructor(private readonly repository: CollaborativeTasksRepository) {}

  async create(therapistId: string, dto: CreateCollaborativeTaskDto) {
    const taskId = `CTK_${Date.now()}`;
    await this.repository.createTask({
      taskId,
      therapistId,
      clientId: dto.clientId,
      title: dto.title,
      description: dto.description,
      taskType: dto.taskType,
      fields: dto.fields,
    });

    return { taskId };
  }

  async findAll(user: { userId: string; role: string }, query: GetCollaborativeTasksQueryDto) {
    return this.repository.getTasks(user, query.clientId);
  }

  async findOne(user: { userId: string }, taskId: string) {
    const task = await this.repository.getTaskById(taskId);
    if (!task) {
      throw new NotFoundException('Gorev bulunamadi');
    }

    if (task.therapistId !== user.userId && task.clientId !== user.userId) {
      throw new ForbiddenException('Bu goreve erisim yetkiniz yok');
    }

    return task;
  }

  async update(user: { userId: string }, taskId: string, dto: UpdateCollaborativeTaskDto) {
    const task = await this.repository.getTaskById(taskId);
    if (!task) {
      throw new NotFoundException('Gorev bulunamadi');
    }

    if (task.therapistId !== user.userId && task.clientId !== user.userId) {
      throw new ForbiddenException('Bu gorevi guncelleme yetkiniz yok');
    }

    await this.repository.updateTask(taskId, dto);
    return { success: true };
  }
}
