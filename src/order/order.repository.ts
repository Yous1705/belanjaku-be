import { Order } from './entities/order.entity';
import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  findProduct(productId: number) {
    return this.prisma.product.findUnique({
      where: { id: productId },
    });
  }

  findCartByUserId(userId: number) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  createOrder(tx: Prisma.TransactionClient, data: Prisma.OrderCreateInput) {
    return tx.order.create({
      data,
    });
  }

  findMyOrderByPendingStatus(userId: number) {
    return this.prisma.order.findMany({
      where: {
        user: {
          id: userId,
        },
        status: OrderStatus.PENDING,
      },

      select: {
        totalPrice: true,
        id: true,
        items: {
          select: {
            quantity: true,
            price: true,
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  createOrderItem(
    tx: Prisma.TransactionClient,
    data: Prisma.OrderItemCreateManyInput[],
  ) {
    return tx.orderItem.createMany({
      data,
    });
  }

  createPayment(tx: Prisma.TransactionClient, data: Prisma.PaymentCreateInput) {
    return tx.payment.create({
      data,
    });
  }

  clearCart(tx: Prisma.TransactionClient, cartId: number) {
    return tx.cartItem.deleteMany({
      where: {
        cart: {
          id: cartId,
        },
      },
    });
  }

  cancleOrder(tx: Prisma.TransactionClient, orderId: number) {
    return tx.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: OrderStatus.CANCELLED,
      },
    });
  }

  findAllMyOrders(userId: number) {
    return this.prisma.order.findMany({
      where: {
        user: {
          id: userId,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOrderById(orderId: number) {
    return this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }
}
