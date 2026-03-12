import { IsOptional, IsString } from 'class-validator';

export class GetTestSubmissionsQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;
}
