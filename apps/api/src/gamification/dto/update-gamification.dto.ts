import { IsNumber } from 'class-validator';

export class UpdateGamificationDto {
  @IsNumber()
  xp!: number;
}
