import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConnectClientDto } from './dto/connect-client.dto';
import { SearchUsersQueryDto } from './dto/search-users-query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';
import { Param, Post, Query } from '@nestjs/common';

interface AuthRequest {
  user: {
    userId: string;
    role: string;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Req() req: AuthRequest) {
    const profile = await this.usersService.getProfile(req.user.userId);
    return {
      success: true,
      data: profile,
    };
  }

  @Patch('profile')
  async updateProfile(@Req() req: AuthRequest, @Body() dto: UpdateProfileDto) {
    await this.usersService.updateProfile(req.user.userId, dto);
    const profile = await this.usersService.getProfile(req.user.userId);

    return {
      success: true,
      data: profile,
    };
  }

  @Patch('password')
  async changePassword(@Req() req: AuthRequest, @Body() dto: ChangePasswordDto) {
    await this.usersService.changePassword(req.user.userId, dto.newPassword);

    return {
      success: true,
      data: true,
    };
  }

  @Get('clients')
  async getClients(@Req() req: AuthRequest) {
    const data = await this.usersService.getTherapistClients(req.user.userId);
    return { success: true, data };
  }

  @Post('clients')
  async connectClient(@Req() req: AuthRequest, @Body() dto: ConnectClientDto) {
    const data = await this.usersService.connectClientToTherapist(req.user.userId, dto);
    return {
      success: true,
      message: 'Danisan basariyla baglandi',
      data,
    };
  }

  @Get('clients/:clientId')
  async getClientDetail(@Req() req: AuthRequest, @Param('clientId') clientId: string) {
    const data = await this.usersService.getClientDetailForTherapist(
      req.user.userId,
      clientId
    );
    return { success: true, data };
  }

  @Get('search')
  async searchUsers(@Query() query: SearchUsersQueryDto) {
    const data = await this.usersService.searchUsers(query);
    return { success: true, data };
  }
}
