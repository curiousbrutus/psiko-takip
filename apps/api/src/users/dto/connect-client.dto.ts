import { IsEmail } from 'class-validator';

export class ConnectClientDto {
  @IsEmail()
  email!: string;
}
