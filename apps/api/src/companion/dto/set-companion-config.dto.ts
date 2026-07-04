import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class SetCompanionConfigDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  approach?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  tone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  goals?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  forbiddenTopics?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  treatmentNotes?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  escalationSensitivity?: 'low' | 'medium' | 'high';
}
