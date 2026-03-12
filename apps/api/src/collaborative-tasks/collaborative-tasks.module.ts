import { Module } from '@nestjs/common';
import { CollaborativeTasksRepository } from '../database/repositories/collaborative-tasks.repository';
import { CollaborativeTasksController } from './collaborative-tasks.controller';
import { CollaborativeTasksService } from './collaborative-tasks.service';

@Module({
  providers: [CollaborativeTasksRepository, CollaborativeTasksService],
  controllers: [CollaborativeTasksController],
})
export class CollaborativeTasksModule {}
