import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConnectClientDto } from './dto/connect-client.dto';
import { SearchUsersQueryDto } from './dto/search-users-query.dto';
import { UpdateClientStatusDto } from './dto/update-client-status.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

interface AuthRequest {
  user: {
    userId: string;
    role: string;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
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
  @Roles('terapist')
  async getClients(@Req() req: AuthRequest) {
    const data = await this.usersService.getTherapistClients(req.user.userId);
    return { success: true, data };
  }

  @Post('clients')
  @Roles('terapist')
  async connectClient(@Req() req: AuthRequest, @Body() dto: ConnectClientDto) {
    const data = await this.usersService.connectClientToTherapist(req.user.userId, dto);
    const message =
      data.type === 'linked'
        ? 'Danisan basariyla baglandi'
        : 'Davet olusturuldu. Danisan bu e-posta ile kayit oldugunda otomatik baglanacak';
    return {
      success: true,
      message,
      data,
    };
  }

  @Patch('clients/:clientId')
  @Roles('terapist')
  async updateClientStatus(
    @Req() req: AuthRequest,
    @Param('clientId') clientId: string,
    @Body() dto: UpdateClientStatusDto
  ) {
    const data = await this.usersService.updateClientStatus(
      req.user.userId,
      clientId,
      dto.status
    );
    return { success: true, data };
  }

  @Get('clients/:clientId')
  @Roles('terapist')
  async getClientDetail(@Req() req: AuthRequest, @Param('clientId') clientId: string) {
    const data = await this.usersService.getClientDetailForTherapist(
      req.user.userId,
      clientId
    );
    return { success: true, data };
  }

  @Get('search')
  @Roles('terapist', 'kurum_yoneticisi')
  async searchUsers(@Query() query: SearchUsersQueryDto) {
    const data = await this.usersService.searchUsers(query);
    return { success: true, data };
  }
}
