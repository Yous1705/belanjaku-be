import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({
      data,
      include: {
        images: true,
        specifications: true,
      },
    });
  }

  updateBySlug(slug: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({
      where: { slug: slug },
      data,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        images: {
          select: {
            url: true,
          },
        },
      },
    });
  }

  addMoreImages(slug: string, newUrls: string[]) {
    return this.prisma.product.update({
      where: { slug: slug },
      data: {
        images: {
          create: newUrls.map((url) => ({
            url,
          })),
        },
      },
      include: {
        images: true,
      },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        images: {
          select: {
            url: true,
          },
        },
        specifications: true,
        reviews: true,
      },
    });
  }

  findAllProducts(
    userId: number,
    filter?: { name?: string; category?: string },
  ) {
    return this.prisma.product.findMany({
      where: {
        ...(filter?.name && {
          name: { contains: filter.name, mode: 'insensitive' },
        }),
        ...(filter?.category && { category: { name: filter.category } }),
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        images: {
          select: {
            url: true,
          },
        },
        wishlists: {
          where: {
            userId: userId,
          },
          select: {
            id: true,
          },
        },
      },
    });
  }

  getAllMyProduct() {
    return this.prisma.product.findMany({
      include: {
        category: {
          select: {
            name: true,
          },
        },
        images: {
          select: {
            url: true,
          },
        },
      },
    });
  }

  delete(slug: string) {
    return this.prisma.product.delete({
      where: { slug: slug },
    });
  }
}
