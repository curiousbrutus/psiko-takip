import { Module } from '@nestjs/common';
import { AiModule } from '../ai';
import { RolesGuard } from '../auth/roles.guard';
import { CompanionController } from './companion.controller';
import { CompanionService } from './companion.service';

@Module({
  imports: [AiModule],
  controllers: [CompanionController],
  providers: [CompanionService, RolesGuard],
})
export class CompanionModule {}
