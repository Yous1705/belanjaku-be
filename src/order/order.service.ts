import { connect } from 'http2';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderRepository } from './order.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';

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
        throw new BadRequestException('Cart is empty');
      }

      for (const item of cart.items) {
        if (item.quantity > item.product.stock) {
          throw new BadRequestException(
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
        status: PaymentStatus.PENDING,
        method: 'Midtrans',
      });

      await this.repo.clearCart(tx, cart.id);

      return order;
    });
  }

  async buyNow(userId: number, productId: number, quantity: number) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.stock < quantity) {
        throw new BadRequestException(
          `Stock not enough. Available: ${product.stock}`,
        );
      }

      const price =
        product.isDiscount && product.discountPrice
          ? Number(product.discountPrice)
          : product.price;

      const totalPrice = price * quantity;

      const order = await tx.order.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          totalPrice,
          status: OrderStatus.PENDING,
        },
      });

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity,
          price,
        },
      });

      await tx.payment.create({
        data: {
          order: {
            connect: {
              id: order.id,
            },
          },
          amount: totalPrice,
          status: PaymentStatus.PENDING,
          method: 'Midtrans',
        },
      });

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

  async findMyOrderByPendingStatus(userId: number) {
    const orders = await this.repo.findMyOrderByPendingStatus(userId);

    if (!orders || orders.length === 0) {
      throw new BadRequestException('Order not found');
    }

    const formattedOrder = orders.map((order) => {
      const itemsWithTotal = order.items.map((item) => ({
        ...item,
        total: item.price * item.quantity,
      }));
      return {
        ...order,
        items: itemsWithTotal,
      };
    });

    return formattedOrder;
  }
}
