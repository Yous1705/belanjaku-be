import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  // create-product.dto.ts
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountPrice?: number;

  @IsNumber()
  @IsOptional()
  discountPercent?: number;

  @IsDateString()
  @IsOptional()
  discountExpiry?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  discountDays?: number;
}
