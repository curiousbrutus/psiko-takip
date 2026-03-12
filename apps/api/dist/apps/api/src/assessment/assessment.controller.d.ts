import { AssessmentService } from './assessment.service';
import { CreateAssessmentResultDto } from './dto/create-assessment-result.dto';
import { CreateAssessmentTaskDto } from './dto/create-assessment-task.dto';
import { GetAssessmentQueryDto } from './dto/get-assessment-query.dto';
interface AuthRequest {
    user: {
        userId: string;
        role: string;
    };
}
export declare class AssessmentController {
    private readonly assessmentService;
    constructor(assessmentService: AssessmentService);
    createTask(req: AuthRequest, dto: CreateAssessmentTaskDto): Promise<{
        success: boolean;
        data: {
            taskId: string;
        };
    }>;
    getTasks(req: AuthRequest, query: GetAssessmentQueryDto): Promise<{
        success: boolean;
        data: import("../database/repositories/assessment.repository").AssessmentTaskRecord[];
    }>;
    getTaskById(req: AuthRequest, taskId: string): Promise<{
        success: boolean;
        data: import("../database/repositories/assessment.repository").AssessmentTaskRecord;
    }>;
    createResult(req: AuthRequest, dto: CreateAssessmentResultDto): Promise<{
        success: boolean;
        data: {
            resultId: string;
        };
    }>;
    getResults(req: AuthRequest, query: GetAssessmentQueryDto): Promise<{
        success: boolean;
        data: import("../database/repositories/assessment.repository").AssessmentResultRecord[];
    }>;
}
export {};
