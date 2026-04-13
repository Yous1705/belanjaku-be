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
      });

      return {
        message: 'Product removed from wishlist',
        isWishlisted: false,
        productId: product.id,
      };
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
            images: {
              take: 1,
              select: {
                url: true,
              },
            },
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      message: 'Product added to wishlist',
      isWishlisted: true,
      productId: product.id,
    };
  }

  async getMyWishlist(userId: number) {
    const data = await this.prisma.wishlist.findMany({
      where: { userId },
      select: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            category: {
              select: {
                name: true,
              },
            },
            images: {
              take: 1,
              select: {
                url: true,
              },
            },
          },
        },
      },
    });

    return data.map((w) => ({
      id: w.product.id,
      name: w.product.name,
      slug: w.product.slug,
      price: w.product.price,
      category: w.product.category?.name,
      image: w.product.images?.[0]?.url || null,
    }));
  }
}
