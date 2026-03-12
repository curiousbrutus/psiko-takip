import { CollaborativeTasksRepository } from '../database/repositories/collaborative-tasks.repository';
import { CreateCollaborativeTaskDto } from './dto/create-collaborative-task.dto';
import { GetCollaborativeTasksQueryDto } from './dto/get-collaborative-tasks-query.dto';
import { UpdateCollaborativeTaskDto } from './dto/update-collaborative-task.dto';
export declare class CollaborativeTasksService {
    private readonly repository;
    constructor(repository: CollaborativeTasksRepository);
    create(therapistId: string, dto: CreateCollaborativeTaskDto): Promise<{
        taskId: string;
    }>;
    findAll(user: {
        userId: string;
        role: string;
    }, query: GetCollaborativeTasksQueryDto): Promise<import("../database/repositories/collaborative-tasks.repository").CollaborativeTaskRecord[]>;
    findOne(user: {
        userId: string;
    }, taskId: string): Promise<import("../database/repositories/collaborative-tasks.repository").CollaborativeTaskRecord>;
    update(user: {
        userId: string;
    }, taskId: string, dto: UpdateCollaborativeTaskDto): Promise<{
        success: boolean;
    }>;
}
