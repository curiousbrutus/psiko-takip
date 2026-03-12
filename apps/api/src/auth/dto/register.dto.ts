import { UserRole } from '@psikotakip/shared/types';
import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(2)
  displayName!: string;

  @IsString()
  @IsIn(['danisan', 'terapist', 'kurum_yoneticisi'])
  role!: UserRole;
}
