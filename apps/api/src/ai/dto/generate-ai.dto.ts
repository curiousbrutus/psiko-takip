import { IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class GenerateAiDto {
  @IsString()
  @MinLength(1)
  prompt!: string;

  @IsOptional()
  @IsString()
  system?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;
}
