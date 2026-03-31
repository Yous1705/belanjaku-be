import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data });
  }

  updateBySlug(slug: string, storeId: number, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({
      where: { slug: slug, storeId: storeId },
      data,
    });
  }

  findStoreByUserId(userId: number) {
    return this.prisma.store.findUnique({
      where: { userId: userId },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
    });
  }

  findAllProducts() {
    return this.prisma.product.findMany();
  }

  getAllMyProduct(userId: number) {
    return this.prisma.user.findMany({
      where: { id: userId },
      select: {
        store: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  delete(slug: string, storeId: number) {
    return this.prisma.product.delete({
      where: { slug: slug, storeId: storeId },
    });
  }
}
