import { IsOptional, IsString } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  slug: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  logo: string;
}
