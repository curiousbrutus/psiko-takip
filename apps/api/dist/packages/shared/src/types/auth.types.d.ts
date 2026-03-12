import type { User, UserRole } from './user.types';
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    email: string;
    password: string;
    displayName: string;
    role: UserRole;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export interface JwtPayload {
    userId: string;
    email: string;
    role: UserRole;
    displayName: string;
}
export interface AuthResponse extends TokenPair {
    user: User;
}
