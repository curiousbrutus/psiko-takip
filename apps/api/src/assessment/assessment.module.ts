import { Module } from '@nestjs/common';
import { AssessmentRepository } from '../database/repositories/assessment.repository';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';

@Module({
  providers: [AssessmentRepository, AssessmentService],
  controllers: [AssessmentController],
})
export class AssessmentModule {}
