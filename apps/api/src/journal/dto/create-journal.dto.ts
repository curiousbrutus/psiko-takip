import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateJournalDto {
  @IsString()
  @MinLength(1)
  content!: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsBoolean()
  isShared?: boolean;
}
