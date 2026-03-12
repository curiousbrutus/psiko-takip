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
export declare class CollaborativeTasksController {
    private readonly service;
    constructor(service: CollaborativeTasksService);
    create(req: AuthRequest, dto: CreateCollaborativeTaskDto): Promise<{
        success: boolean;
        data: {
            taskId: string;
        };
    }>;
    findAll(req: AuthRequest, query: GetCollaborativeTasksQueryDto): Promise<{
        success: boolean;
        data: import("../database/repositories/collaborative-tasks.repository").CollaborativeTaskRecord[];
    }>;
    findOne(req: AuthRequest, taskId: string): Promise<{
        success: boolean;
        data: import("../database/repositories/collaborative-tasks.repository").CollaborativeTaskRecord;
    }>;
    update(req: AuthRequest, taskId: string, dto: UpdateCollaborativeTaskDto): Promise<{
        success: boolean;
    }>;
}
export {};
