import { TestSubmissionsRepository } from '../database/repositories/test-submissions.repository';
import { CreateTestSubmissionDto } from './dto/create-test-submission.dto';
import { GetTestSubmissionsQueryDto } from './dto/get-test-submissions-query.dto';
export declare class TestsService {
    private readonly repository;
    constructor(repository: TestSubmissionsRepository);
    create(userId: string, dto: CreateTestSubmissionDto): Promise<{
        submissionId: string;
    }>;
    findAll(user: {
        userId: string;
        role: string;
    }, query: GetTestSubmissionsQueryDto): Promise<import("../database/repositories/test-submissions.repository").TestSubmissionRecord[]>;
}
