import { IsOptional, IsString } from 'class-validator';

export class GetCollaborativeTasksQueryDto {
  @IsOptional()
  @IsString()
  clientId?: string;
}
