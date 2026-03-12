import { IsOptional, IsString } from 'class-validator';

export class GetMoodQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string;
}
