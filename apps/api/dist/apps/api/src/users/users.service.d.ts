import { User, UserRole } from '@psikotakip/shared/types';
import { OracleService } from '../database/oracle.service';
import { ConnectClientDto } from './dto/connect-client.dto';
import { SearchUsersQueryDto } from './dto/search-users-query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
interface DbUser extends User {
    passwordHash: string;
}
export declare class UsersService {
    private readonly oracleService;
    constructor(oracleService: OracleService);
    findByEmailWithPassword(email: string): Promise<DbUser | null>;
    createUser(input: {
        email: string;
        passwordHash: string;
        displayName: string;
        role: UserRole;
    }): Promise<User>;
    getProfile(userId: string): Promise<User | null>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<void>;
    changePassword(userId: string, newPassword: string): Promise<void>;
    getTherapistClients(therapistId: string): Promise<unknown[]>;
    connectClientToTherapist(therapistId: string, dto: ConnectClientDto): Promise<{
        clientId: string;
        clientName: string;
        clientEmail: string;
    }>;
    searchUsers(query: SearchUsersQueryDto): Promise<unknown[]>;
    getClientDetailForTherapist(therapistId: string, clientId: string): Promise<{
        client: User;
        journals: unknown[];
        tests: unknown[];
        appointments: unknown[];
        tasks: unknown[];
        moods: unknown[];
        gamification: unknown;
    }>;
}
export {};
