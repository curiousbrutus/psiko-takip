import { Module } from '@nestjs/common';
import { GratitudeRepository } from '../database/repositories/gratitude.repository';
import { GratitudeController } from './gratitude.controller';
import { GratitudeService } from './gratitude.service';

@Module({
  providers: [GratitudeRepository, GratitudeService],
  controllers: [GratitudeController],
})
export class GratitudeModule {}
