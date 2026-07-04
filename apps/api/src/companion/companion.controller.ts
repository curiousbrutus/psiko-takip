import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CompanionService } from './companion.service';
import { SetCompanionConfigDto } from './dto/set-companion-config.dto';
import { CompanionChatDto } from './dto/companion-chat.dto';

interface AuthRequest {
  user: { userId: string; role: string };
}

@Controller('companion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanionController {
  constructor(private readonly companionService: CompanionService) {}

  @Get('config/:clientId')
  @Roles('terapist')
  async getConfig(@Req() req: AuthRequest, @Param('clientId') clientId: string) {
    const data = await this.companionService.getConfig(req.user.userId, clientId);
    return { success: true, data };
  }

  @Put('config/:clientId')
  @Roles('terapist')
  async setConfig(
    @Req() req: AuthRequest,
    @Param('clientId') clientId: string,
    @Body() dto: SetCompanionConfigDto
  ) {
    const data = await this.companionService.setConfig(req.user.userId, clientId, dto);
    return { success: true, data };
  }

  @Get('flags/:clientId')
  @Roles('terapist')
  async getFlags(@Req() req: AuthRequest, @Param('clientId') clientId: string) {
    const data = await this.companionService.getFlags(req.user.userId, clientId);
    return { success: true, data };
  }

  @Post('chat')
  @Roles('danisan')
  async chat(@Req() req: AuthRequest, @Body() dto: CompanionChatDto) {
    const data = await this.companionService.chat(req.user.userId, dto.message);
    return { success: true, data };
  }

  @Get('messages')
  @Roles('danisan')
  async messages(@Req() req: AuthRequest) {
    const data = await this.companionService.getMessages(req.user.userId);
    return { success: true, data };
  }
}
