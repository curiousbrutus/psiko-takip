import { Injectable } from '@nestjs/common';
import { TestSubmissionsRepository } from '../database/repositories/test-submissions.repository';
import { CreateTestSubmissionDto } from './dto/create-test-submission.dto';
import { GetTestSubmissionsQueryDto } from './dto/get-test-submissions-query.dto';

@Injectable()
export class TestsService {
  constructor(private readonly repository: TestSubmissionsRepository) {}

  async create(userId: string, dto: CreateTestSubmissionDto) {
    const submissionId = `TST_${Date.now()}`;
    await this.repository.createSubmission({
      submissionId,
      userId,
      testName: dto.testName,
      totalScore: dto.totalScore,
      answers: dto.answers,
      severityLevel: dto.severityLevel,
    });

    return { submissionId };
  }

  async findAll(user: { userId: string; role: string }, query: GetTestSubmissionsQueryDto) {
    return this.repository.getSubmissions(user, query.userId);
  }
}
