import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create-category')
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get('all-categories')
  findAll() {
    return this.categoryService.findAll();
  }

  @Patch('update-category/:id')
  update(@Body() dto: UpdateCategoryDto, @Param('id') id: number) {
    return this.categoryService.update(dto, id);
  }
}
