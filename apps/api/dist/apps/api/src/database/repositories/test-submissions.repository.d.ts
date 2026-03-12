import { OracleService } from '../oracle.service';
export interface TestSubmissionRecord {
    submissionId: string;
    userId: string;
    testName: string;
    totalScore: number;
    answers: string | null;
    severityLevel: string | null;
    createdAt: string;
}
export declare class TestSubmissionsRepository {
    private readonly oracleService;
    constructor(oracleService: OracleService);
    createSubmission(input: {
        submissionId: string;
        userId: string;
        testName: string;
        totalScore: number;
        answers?: unknown;
        severityLevel?: string;
    }): Promise<void>;
    getSubmissions(user: {
        userId: string;
        role: string;
    }, userId?: string): Promise<TestSubmissionRecord[]>;
}
