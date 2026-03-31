import { Role } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class RegisterSellerDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;
}
