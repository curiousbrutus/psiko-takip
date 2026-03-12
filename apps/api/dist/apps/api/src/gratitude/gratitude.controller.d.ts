import { CreateGratitudeDto } from './dto/create-gratitude.dto';
import { GratitudeService } from './gratitude.service';
interface AuthRequest {
    user: {
        userId: string;
    };
}
export declare class GratitudeController {
    private readonly gratitudeService;
    constructor(gratitudeService: GratitudeService);
    create(req: AuthRequest, dto: CreateGratitudeDto): Promise<{
        success: boolean;
        data: {
            entryId: string;
        };
    }>;
    findAll(req: AuthRequest): Promise<{
        success: boolean;
        data: import("../database/repositories/gratitude.repository").GratitudeEntryRecord[];
    }>;
}
export {};
