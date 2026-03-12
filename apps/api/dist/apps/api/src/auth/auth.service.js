"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcryptjs_1 = require("bcryptjs");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(dto) {
        const userWithPassword = await this.usersService.findByEmailWithPassword(dto.email);
        if (!userWithPassword) {
            throw new common_1.UnauthorizedException('E-posta veya şifre hatalı');
        }
        const isPasswordValid = await (0, bcryptjs_1.compare)(dto.password, userWithPassword.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('E-posta veya şifre hatalı');
        }
        if (userWithPassword.status !== 'active') {
            throw new common_1.UnauthorizedException('Hesabınız aktif değil');
        }
        const user = {
            userId: userWithPassword.userId,
            email: userWithPassword.email,
            displayName: userWithPassword.displayName,
            role: userWithPassword.role,
            status: userWithPassword.status,
            connectedTherapistId: userWithPassword.connectedTherapistId,
            phone: userWithPassword.phone,
        };
        return {
            user,
            ...this.generateTokens(user),
        };
    }
    async register(dto) {
        const passwordHash = await (0, bcryptjs_1.hash)(dto.password, 10);
        const user = await this.usersService.createUser({ ...dto, passwordHash });
        return {
            user,
            ...this.generateTokens(user),
        };
    }
    async refresh(dto) {
        const refreshSecret = this.configService.get('jwt.refreshSecret') || 'dev-refresh-secret';
        try {
            const payload = this.jwtService.verify(dto.refreshToken, {
                secret: refreshSecret,
            });
            const user = await this.usersService.getProfile(payload.userId);
            if (!user || user.status !== 'active') {
                throw new common_1.UnauthorizedException('Geçersiz yenileme oturumu');
            }
            return this.generateTokens(user);
        }
        catch {
            throw new common_1.UnauthorizedException('Geçersiz yenileme tokeni');
        }
    }
    async logout() {
        return { success: true };
    }
    generateTokens(user) {
        const payload = {
            userId: user.userId,
            email: user.email,
            role: user.role,
            displayName: user.displayName,
        };
        const secret = this.configService.get('jwt.secret') || 'dev-secret';
        const refreshSecret = this.configService.get('jwt.refreshSecret') || 'dev-refresh-secret';
        const expiresIn = this.configService.get('jwt.expiresIn') || '15m';
        const refreshExpiresIn = this.configService.get('jwt.refreshExpiresIn') || '7d';
        return {
            accessToken: this.jwtService.sign(payload, { secret, expiresIn }),
            refreshToken: this.jwtService.sign(payload, {
                secret: refreshSecret,
                expiresIn: refreshExpiresIn,
            }),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map