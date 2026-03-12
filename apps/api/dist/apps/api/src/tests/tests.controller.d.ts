import { CreateTestSubmissionDto } from './dto/create-test-submission.dto';
import { GetTestSubmissionsQueryDto } from './dto/get-test-submissions-query.dto';
import { TestsService } from './tests.service';
interface AuthRequest {
    user: {
        userId: string;
        role: string;
    };
}
export declare class TestsController {
    private readonly service;
    constructor(service: TestsService);
    create(req: AuthRequest, dto: CreateTestSubmissionDto): Promise<{
        success: boolean;
        data: {
            submissionId: string;
        };
    }>;
    findAll(req: AuthRequest, query: GetTestSubmissionsQueryDto): Promise<{
        success: boolean;
        data: import("../database/repositories/test-submissions.repository").TestSubmissionRecord[];
    }>;
}
export {};
