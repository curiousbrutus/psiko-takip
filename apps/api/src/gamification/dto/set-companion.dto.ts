import { IsString, MinLength } from 'class-validator';

export class SetCompanionDto {
  @IsString()
  @MinLength(1)
  companionType!: string;
}
