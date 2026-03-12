import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AssessmentRepository } from '../database/repositories/assessment.repository';
import { CreateAssessmentResultDto } from './dto/create-assessment-result.dto';
import { CreateAssessmentTaskDto } from './dto/create-assessment-task.dto';
import { GetAssessmentQueryDto } from './dto/get-assessment-query.dto';

@Injectable()
export class AssessmentService {
  constructor(private readonly assessmentRepository: AssessmentRepository) {}

  async createTask(therapistId: string, dto: CreateAssessmentTaskDto) {
    const taskId = `ATK_${Date.now()}`;
    await this.assessmentRepository.createTask({
      taskId,
      therapistId,
      clientId: dto.clientId,
      testName: dto.testName,
      dueDate: dto.dueDate,
      notes: dto.notes,
    });

    return { taskId };
  }

  async getTasks(user: { userId: string; role: string }, query: GetAssessmentQueryDto) {
    return this.assessmentRepository.getTasks(user, query.clientId);
  }

  async getTaskById(user: { userId: string }, taskId: string) {
    const task = await this.assessmentRepository.getTaskById(taskId);
    if (!task) {
      throw new NotFoundException('Degerlendirme gorevi bulunamadi');
    }

    if (task.therapistId !== user.userId && task.clientId !== user.userId) {
      throw new ForbiddenException('Bu goreve erisim yetkiniz yok');
    }

    return task;
  }

  async createResult(userId: string, dto: CreateAssessmentResultDto) {
    const resultId = `ARR_${Date.now()}`;
    await this.assessmentRepository.createResult({
      resultId,
      taskId: dto.taskId,
      userId,
      testName: dto.testName,
      totalScore: dto.totalScore,
      answers: dto.answers,
      severityLevel: dto.severityLevel,
    });

    return { resultId };
  }

  async getResults(user: { userId: string; role: string }, query: GetAssessmentQueryDto) {
    return this.assessmentRepository.getResults(user, query.clientId);
  }
}
