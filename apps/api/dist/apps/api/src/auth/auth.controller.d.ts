import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<import("@psikotakip/shared/types").AuthResponse>;
    register(dto: RegisterDto): Promise<import("@psikotakip/shared/types").AuthResponse>;
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(): Promise<{
        success: boolean;
    }>;
    me(req: {
        user: unknown;
    }): {
        success: boolean;
        data: unknown;
    };
}
