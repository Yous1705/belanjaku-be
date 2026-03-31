import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from './category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly repo: CategoryRepository) {}

  async create(dto: CreateCategoryDto) {
    return this.repo.create(dto);
  }

  update(dto: UpdateCategoryDto, id: number) {
    return this.repo.update(dto, id);
  }

  findAll() {
    return this.repo.findAll();
  }
}
