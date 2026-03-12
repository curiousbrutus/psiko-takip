import { GratitudeRepository } from '../database/repositories/gratitude.repository';
import { CreateGratitudeDto } from './dto/create-gratitude.dto';
export declare class GratitudeService {
    private readonly gratitudeRepository;
    constructor(gratitudeRepository: GratitudeRepository);
    create(userId: string, dto: CreateGratitudeDto): Promise<{
        entryId: string;
    }>;
    findAll(userId: string): Promise<import("../database/repositories/gratitude.repository").GratitudeEntryRecord[]>;
}
