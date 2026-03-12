import { AssessmentRepository } from '../database/repositories/assessment.repository';
import { CreateAssessmentResultDto } from './dto/create-assessment-result.dto';
import { CreateAssessmentTaskDto } from './dto/create-assessment-task.dto';
import { GetAssessmentQueryDto } from './dto/get-assessment-query.dto';
export declare class AssessmentService {
    private readonly assessmentRepository;
    constructor(assessmentRepository: AssessmentRepository);
    createTask(therapistId: string, dto: CreateAssessmentTaskDto): Promise<{
        taskId: string;
    }>;
    getTasks(user: {
        userId: string;
        role: string;
    }, query: GetAssessmentQueryDto): Promise<import("../database/repositories/assessment.repository").AssessmentTaskRecord[]>;
    getTaskById(user: {
        userId: string;
    }, taskId: string): Promise<import("../database/repositories/assessment.repository").AssessmentTaskRecord>;
    createResult(userId: string, dto: CreateAssessmentResultDto): Promise<{
        resultId: string;
    }>;
    getResults(user: {
        userId: string;
        role: string;
    }, query: GetAssessmentQueryDto): Promise<import("../database/repositories/assessment.repository").AssessmentResultRecord[]>;
}
