import { IsOptional, IsString } from 'class-validator';

export class UpdateCollaborativeTaskDto {
  @IsOptional()
  fields?: unknown;

  @IsOptional()
  @IsString()
  status?: string;
}
