import { OracleService } from '../oracle.service';
export interface AssessmentTaskRecord {
    taskId: string;
    therapistId: string;
    clientId: string;
    testName: string;
    dueDate: string | null;
    notes: string | null;
    status: string;
    createdAt: string;
    clientName?: string;
    therapistName?: string;
}
export interface AssessmentResultRecord {
    resultId: string;
    taskId: string | null;
    userId: string;
    testName: string;
    totalScore: number;
    answers: string | null;
    severityLevel: string | null;
    createdAt: string;
}
export declare class AssessmentRepository {
    private readonly oracleService;
    constructor(oracleService: OracleService);
    createTask(input: {
        taskId: string;
        therapistId: string;
        clientId: string;
        testName: string;
        dueDate?: string;
        notes?: string;
    }): Promise<void>;
    getTasks(user: {
        userId: string;
        role: string;
    }, clientId?: string): Promise<AssessmentTaskRecord[]>;
    getTaskById(taskId: string): Promise<AssessmentTaskRecord | null>;
    createResult(input: {
        resultId: string;
        taskId?: string;
        userId: string;
        testName: string;
        totalScore: number;
        answers?: unknown;
        severityLevel?: string;
    }): Promise<void>;
    getResults(user: {
        userId: string;
        role: string;
    }, clientId?: string): Promise<AssessmentResultRecord[]>;
}
