import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.CategoryCreateInput) {
    return this.prisma.category.create({ data });
  }

  update(data: Prisma.CategoryUpdateInput, id: number) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  findAll() {
    return this.prisma.category.findMany();
  }
}
