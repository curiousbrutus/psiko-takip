import { IsOptional, IsString } from 'class-validator';

export class GetJournalQueryDto {
  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  isShared?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
