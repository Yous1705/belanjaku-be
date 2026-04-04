import { connect } from 'http2';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderRepository } from './order.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(
    private readonly repo: OrderRepository,
    private readonly prisma: PrismaService,
  ) {}

  async checkout(userId: number) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await this.repo.findCartByUserId(userId);

      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      for (const item of cart.items) {
        if (item.quantity > item.product.stock) {
          throw new Error(
            `Product ${item.product.name} is out of stock. Available: ${item.product.stock}`,
          );
        }
      }

      const totalPrice = cart.items.reduce((total, item) => {
        return total + item.quantity * item.product.price;
      }, 0);

      const order = await this.repo.createOrder(tx, {
        user: {
          connect: {
            id: userId,
          },
        },
        totalPrice,
        status: OrderStatus.PENDING,
      });

      const orderItems = cart.items.map((item) => {
        return {
          orderId: order.id,
          productId: item.productId,
          price: item.product.price,
          quantity: item.quantity,
        };
      });

      await this.repo.createOrderItem(tx, orderItems);

      await this.repo.createPayment(tx, {
        order: {
          connect: {
            id: order.id,
          },
        },
        amount: totalPrice,
        status: OrderStatus.PENDING,
        method: 'Midtrans',
      });

      await this.repo.clearCart(tx, cart.id);

      return order;
    });
  }

  async cancelOrder(orderId: number) {
    return this.prisma.$transaction(async (tx) => {
      const order = await this.repo.findOrderById(orderId);

      if (!order) {
        throw new BadRequestException('Order not found');
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException('Only pending orders can be cancelled');
      }

      await this.repo.cancleOrder(tx, orderId);

      return {
        message: 'Order cancelled successfully',
      };
    });
  }

  findAllMyOrders(userId: number) {
    return this.repo.findAllMyOrders(userId);
  }
}
