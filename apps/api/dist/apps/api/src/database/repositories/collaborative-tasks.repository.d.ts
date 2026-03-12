import { OracleService } from '../oracle.service';
export interface CollaborativeTaskRecord {
    taskId: string;
    therapistId: string;
    clientId: string;
    title: string;
    description: string | null;
    taskType: string;
    fields: string | null;
    status: string;
    createdAt: string;
    updatedAt: string | null;
    clientName?: string;
    therapistName?: string;
}
export declare class CollaborativeTasksRepository {
    private readonly oracleService;
    constructor(oracleService: OracleService);
    createTask(input: {
        taskId: string;
        therapistId: string;
        clientId: string;
        title: string;
        description?: string;
        taskType?: string;
        fields?: unknown;
    }): Promise<void>;
    getTasks(user: {
        userId: string;
        role: string;
    }, clientId?: string): Promise<CollaborativeTaskRecord[]>;
    getTaskById(taskId: string): Promise<CollaborativeTaskRecord | null>;
    updateTask(taskId: string, updates: {
        fields?: unknown;
        status?: string;
    }): Promise<void>;
}
