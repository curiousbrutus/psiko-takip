import { IsOptional, IsString, MinLength } from 'class-validator';

export class SearchUsersQueryDto {
  @IsString()
  @MinLength(2)
  q!: string;

  @IsOptional()
  @IsString()
  role?: string;
}
