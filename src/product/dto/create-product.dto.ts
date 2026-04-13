import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class SpecificationDto {
  @IsString()
  key: string;

  @IsString()
  value: string;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsString()
  description: string;

  @IsInt()
  stock: number;

  @IsInt()
  category: number;

  @IsString({ each: true })
  @IsOptional()
  images: string[];

  // Tambahkan ini
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SpecificationDto)
  specifications?: SpecificationDto[];
}
