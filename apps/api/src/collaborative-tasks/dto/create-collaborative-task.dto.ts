import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCollaborativeTaskDto {
  @IsString()
  @MinLength(1)
  clientId!: string;

  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  taskType?: string;

  @IsOptional()
  fields?: unknown;
}
