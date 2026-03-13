import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcryptjs';
import { AuthResponse, JwtPayload, User } from '@psikotakip/shared/types';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async login(dto: LoginDto): Promise<AuthResponse> {
    const userWithPassword = await this.usersService.findByEmailWithPassword(dto.email);

    if (!userWithPassword) {
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    const isPasswordValid = await compare(dto.password, userWithPassword.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    if (userWithPassword.status !== 'active') {
      throw new UnauthorizedException('Hesabınız aktif değil');
    }

    const user: User = {
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

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const passwordHash = await hash(dto.password, 10);
    const user = await this.usersService.createUser({ ...dto, passwordHash });

    return {
      user,
      ...this.generateTokens(user),
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const refreshSecret =
      this.configService.get<string>('jwt.refreshSecret') || 'dev-refresh-secret';

    try {
      const payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: refreshSecret,
      });

      const user = await this.usersService.getProfile(payload.userId);
      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('Geçersiz yenileme oturumu');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Geçersiz yenileme tokeni');
    }
  }

  async logout() {
    return { success: true };
  }

  private generateTokens(user: User) {
    const payload: JwtPayload = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    };

    const secret = this.configService.get<string>('jwt.secret') || 'dev-secret';
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret') || 'dev-refresh-secret';
    const expiresIn = this.configService.get<string>('jwt.expiresIn') || '15m';
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';

    return {
      accessToken: this.jwtService.sign(payload, { secret, expiresIn }),
      refreshToken: this.jwtService.sign(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    };
  }
}
