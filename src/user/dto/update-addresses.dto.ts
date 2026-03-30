import { IsOptional, IsString } from 'class-validator';

export class UpdateAdressesDto {
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
