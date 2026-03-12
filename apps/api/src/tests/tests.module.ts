import { Module } from '@nestjs/common';
import { TestSubmissionsRepository } from '../database/repositories/test-submissions.repository';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';

@Module({
  providers: [TestSubmissionsRepository, TestsService],
  controllers: [TestsController],
})
export class TestsModule {}
