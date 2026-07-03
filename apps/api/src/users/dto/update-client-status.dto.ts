import { IsIn } from 'class-validator';

export class UpdateClientStatusDto {
  @IsIn(['active', 'passive'])
  status!: 'active' | 'passive';
}
