import { Injectable } from '@nestjs/common';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOrderById(id: number) {
    return this.prisma.order.findUnique({
      where: {
        id: id,
      },
      include: {
        user: true,
        payment: true,
      },
    });
  }

  findOrderByOrderId(orderId: string) {
    return this.prisma.order.findUnique({
      where: {
        orderId: orderId,
      },
      include: {
        items: true,
        payment: true,
      },
    });
  }

  createPayment(data: Prisma.PaymentUncheckedCreateInput) {
    return this.prisma.payment.create({ data });
  }

  updatePayment(orderId: number, data: Prisma.PaymentUpdateInput) {
    return this.prisma.payment.update({
      where: {
        orderId,
      },
      data,
    });
  }

  updateOrder(id: number, data: Prisma.OrderUpdateInput) {
    return this.prisma.order.update({
      where: {
        id,
      },
      data,
    });
  }

  getOrderItems(orderId: number) {
    return this.prisma.orderItem.findMany({
      where: {
        orderId,
      },
    });
  }

  decrementStock(
    tx: Prisma.TransactionClient,
    productId: number,
    quantity: number,
  ) {
    return tx.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
  }

  findOrder(orderId: number, userId: number) {
    return this.prisma.payment.findFirst({
      where: {
        order: {
          id: orderId,
          userId,
        },
      },
      include: {
        order: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async handlesSuccess(pkId: number) {
    return this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId: pkId },
        data: { status: PaymentStatus.SUCCESS },
      });

      await tx.order.update({
        where: { id: pkId },
        data: { status: OrderStatus.PAID },
      });

      const items = await tx.orderItem.findMany({
        where: { orderId: pkId },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    });
  }

  async handleFailed(orderId: number) {
    return this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId },
        data: { status: PaymentStatus.FAILED },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });
    });
  }
}
