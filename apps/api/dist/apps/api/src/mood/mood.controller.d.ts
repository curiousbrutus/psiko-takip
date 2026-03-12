import { CreateMoodDto } from './dto/create-mood.dto';
import { GetMoodQueryDto } from './dto/get-mood-query.dto';
import { MoodService } from './mood.service';
interface AuthRequest {
    user: {
        userId: string;
    };
}
export declare class MoodController {
    private readonly moodService;
    constructor(moodService: MoodService);
    create(req: AuthRequest, dto: CreateMoodDto): Promise<{
        success: boolean;
        data: {
            entryId: string;
        };
    }>;
    findAll(req: AuthRequest, query: GetMoodQueryDto): Promise<{
        success: boolean;
        data: import("../database/repositories/mood.repository").MoodEntryRecord[];
    }>;
}
export {};
