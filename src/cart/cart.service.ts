import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { CartRepository } from './cart.repository';

@Injectable()
export class CartService {
  constructor(private readonly repo: CartRepository) {}

  async getCart(userId: number) {
    const cart = await this.repo.getMycart(userId);
    if (!cart) {
      throw new BadRequestException('Cart not found');
    }

    const items = cart.items.map((item) => {
      const now = new Date();
      const isExpired =
        item.product.discountExpiry && item.product.discountExpiry < now;
      const currentPrice = isExpired
        ? item.product.price
        : (item.product.discountPrice?.toNumber() ?? item.product.price);
      const totalPrice = item.quantity * currentPrice;
      return {
        id: item.productId,
        product: item.product,
        slug: item.product.slug,
        quantity: item.quantity,
        currentPrice,
        totalPrice,
      };
    });

    const grandTotal = items.reduce((acc, item) => acc + item.totalPrice, 0);

    return {
      items,
      grandTotal,
    };
  }

  async addItemToCart(userId: number, slug: string, quantity: number) {
    return this.repo.addItemToCart(userId, slug, quantity);
  }

  async removeItemFromCart(userId: number, slug: string) {
    return this.repo.removeItemFromCart(userId, slug);
  }
}
