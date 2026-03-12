import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMoodDto {
  @IsString()
  @MinLength(1)
  mood!: string;

  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
