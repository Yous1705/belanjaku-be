import { IsInt, IsNumber, IsString } from 'class-validator';

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
}
