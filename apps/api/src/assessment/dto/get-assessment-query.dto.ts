import { IsOptional, IsString } from 'class-validator';

export class GetAssessmentQueryDto {
  @IsOptional()
  @IsString()
  clientId?: string;
}
