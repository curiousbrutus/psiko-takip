import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateGratitudeDto {
  @IsString()
  @MinLength(1)
  content!: string;

  @IsOptional()
  @IsString()
  category?: string;
}
