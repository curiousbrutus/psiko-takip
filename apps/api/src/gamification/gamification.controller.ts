import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateGamificationDto } from './dto/update-gamification.dto';
import { GamificationService } from './gamification.service';
import { SetCompanionDto } from './dto/set-companion.dto';

interface AuthRequest {
  user: {
    userId: string;
  };
}

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get()
  async getCurrent(@Req() req: AuthRequest) {
    const data = await this.gamificationService.getForUser(req.user.userId);
    return { success: true, data };
  }

  @Put()
  async update(@Req() req: AuthRequest, @Body() dto: UpdateGamificationDto) {
    return this.gamificationService.updateXp(req.user.userId, dto);
  }

  @Put('companion')
  async setCompanion(@Req() req: AuthRequest, @Body() dto: SetCompanionDto) {
    return this.gamificationService.setCompanion(req.user.userId, dto);
  }
}
