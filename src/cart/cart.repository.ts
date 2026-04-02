import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  getMycart(userId: number) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
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
        },
      },
    });
  }

  getOrCreateCart(userId: number) {
    return this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
      },
    });
  }

  findProductBySlug(slug: string) {
    return this.prisma.product.findUnique({
      where: { slug },
    });
  }

  async addItemToCart(userId: number, slug: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);

    const product = await this.findProductBySlug(slug);
    if (!product) {
      throw new Error('Product not found');
    }

    return this.prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        cartId: cart.id,
        productId: product.id,
        quantity,
      },
      include: {
        product: {
          include: {
            images: true,
          },
        },
      },
    });
  }

  async removeItemFromCart(userId: number, slug: string) {
    const cart = await this.getOrCreateCart(userId);

    const product = await this.findProductBySlug(slug);
    if (!product) {
      throw new Error('Product not found');
    }

    return this.prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
    });
  }
}
