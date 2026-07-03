import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class ConnectClientDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
