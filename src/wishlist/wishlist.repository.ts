import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WishlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  findProductBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
    });
  }

  async toggleWishlist(userId: number, slug: string) {
    const product = await this.findProductBySlug(slug);
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    const existing = await this.prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: userId,
          productId: product.id,
        },
      },
    });

    if (existing) {
      await this.prisma.wishlist.delete({
        where: {
          userId_productId: {
            userId: userId,
            productId: product.id,
          },
        },
        select: {
          product: {
            select: {
              name: true,
              price: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return { message: 'Product removed from wishlist' };
    }

    await this.prisma.wishlist.create({
      data: {
        userId: userId,
        productId: product.id,
      },
      select: {
        product: {
          select: {
            name: true,
            price: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return { message: 'Product added to wishlist' };
  }

  getMyWishlist(userId: number) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
            price: true,
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
        },
      },
    });
  }
}
