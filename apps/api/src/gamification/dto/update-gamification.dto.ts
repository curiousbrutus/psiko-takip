import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateGamificationDto {
  @IsNumber()
  xp!: number;

  @IsOptional()
  @IsString()
  activityType?: string;
}
