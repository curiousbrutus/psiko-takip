import { MoodRepository } from '../database/repositories/mood.repository';
import { CreateMoodDto } from './dto/create-mood.dto';
import { GetMoodQueryDto } from './dto/get-mood-query.dto';
export declare class MoodService {
    private readonly moodRepository;
    constructor(moodRepository: MoodRepository);
    create(userId: string, dto: CreateMoodDto): Promise<{
        entryId: string;
    }>;
    findAll(userId: string, query: GetMoodQueryDto): Promise<import("../database/repositories/mood.repository").MoodEntryRecord[]>;
}
