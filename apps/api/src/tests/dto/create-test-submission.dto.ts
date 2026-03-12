import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTestSubmissionDto {
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
