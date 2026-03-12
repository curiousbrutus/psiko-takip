import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAssessmentResultDto {
  @IsOptional()
  @IsString()
  taskId?: string;

  @IsString()
  @MinLength(1)
  testName!: string;

  @IsNumber()
  totalScore!: number;

  @IsOptional()
  answers?: unknown;

  @IsOptional()
  @IsString()
  severityLevel?: string;
}
