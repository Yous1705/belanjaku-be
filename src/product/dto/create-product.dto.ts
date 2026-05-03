import { Type, Transform } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { plainToInstance } from 'class-transformer'; // tambah ini

class SpecificationDto {
  @IsString()
  key: string;

  @IsString()
  value: string;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  price: number;

  @IsString()
  description: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  stock: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  category: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SpecificationDto)
  @Transform(({ value }) => {
    let parsed = value;

    // Parse dari string JSON (FormData)
    if (typeof value === 'string') {
      try {
        parsed = JSON.parse(value);
      } catch {
        return [];
      }
    }

    // Pastikan array, lalu hydrate setiap item ke SpecificationDto instance
    if (!Array.isArray(parsed)) return [];

    return plainToInstance(SpecificationDto, parsed); // <-- fix utama
  })
  specifications?: SpecificationDto[];
}
