import { ChangePasswordDto } from './dto/change-password.dto';
import { ConnectClientDto } from './dto/connect-client.dto';
import { SearchUsersQueryDto } from './dto/search-users-query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';
interface AuthRequest {
    user: {
        userId: string;
        role: string;
    };
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: AuthRequest): Promise<{
        success: boolean;
        data: import("@psikotakip/shared/types").User | null;
    }>;
    updateProfile(req: AuthRequest, dto: UpdateProfileDto): Promise<{
        success: boolean;
        data: import("@psikotakip/shared/types").User | null;
    }>;
    changePassword(req: AuthRequest, dto: ChangePasswordDto): Promise<{
        success: boolean;
        data: boolean;
    }>;
    getClients(req: AuthRequest): Promise<{
        success: boolean;
        data: unknown[];
    }>;
    connectClient(req: AuthRequest, dto: ConnectClientDto): Promise<{
        success: boolean;
        message: string;
        data: {
            clientId: string;
            clientName: string;
            clientEmail: string;
        };
    }>;
    getClientDetail(req: AuthRequest, clientId: string): Promise<{
        success: boolean;
        data: {
            client: import("@psikotakip/shared/types").User;
            journals: unknown[];
            tests: unknown[];
            appointments: unknown[];
            tasks: unknown[];
            moods: unknown[];
            gamification: unknown;
        };
    }>;
    searchUsers(query: SearchUsersQueryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
export {};
