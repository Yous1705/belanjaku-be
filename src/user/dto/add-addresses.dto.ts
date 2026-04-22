import { IsOptional, IsString } from 'class-validator';

export class AddAdressesDto {
  @IsString()
  @IsOptional()
  address: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  postal: string;
}
