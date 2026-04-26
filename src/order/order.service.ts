import { OrderItem } from './../../node_modules/.pnpm/@prisma+client@6.19.2_prism_6b2b1af085fe6797f5a5ea830937a8e3/node_modules/.prisma/client/index.d';
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
import midtransClient from 'midtrans-client';

@Injectable()
export class OrderService {
  private snap;
  constructor(
    private readonly repo: OrderRepository,
    private readonly prisma: PrismaService,
  ) {
    this.snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });
  }

  async checkoutCartItem(userId: number, addressId: number) {
    const result = await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: {
          userId,
        },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      const address = await tx.address.findFirst({
        where: {
          id: addressId,
          userId,
        },
      });

      if (!address) {
        throw new BadRequestException('Address not found');
      }

      for (const item of cart.items) {
        if (item.quantity > item.product.stock) {
          throw new BadRequestException(
            `Product ${item.product.name} stock not enough`,
          );
        }
      }

      const totalPrice = cart.items.reduce((total, item) => {
        const price =
          item.product.isDiscount && item.product.discountPrice
            ? Number(item.product.discountPrice)
            : item.product.price;

        return total + price * item.quantity;
      }, 0);

      const order = await tx.order.create({
        data: {
          userId,
          shippingRecipientName: cart.user.name,
          shippingAddress: address.address,
          shippingCity: address.city,
          shippingPostal: address.postal,
          totalPrice,
          status: OrderStatus.PENDING,
        },
      });

      await tx.orderItem.createMany({
        data: cart.items.map((item) => {
          const price =
            item.product.isDiscount && item.product.discountPrice
              ? Number(item.product.discountPrice)
              : item.product.price;

          return {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price,
          };
        }),
      });

      return {
        order,
        user: cart.user,
        items: cart.items,
      };
    });

    const midtransOrderId = `${result.order.orderId}-${Date.now()}`;

    const transaction = await this.snap.createTransaction({
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: result.order.totalPrice,
      },

      customer_details: {
        first_name: result.user.name,
        email: result.user.email,
      },
    });

    const payment = await this.prisma.payment.create({
      data: {
        orderId: result.order.id,
        amount: result.order.totalPrice,
        status: PaymentStatus.PENDING,
        method: 'Midtrans',

        snapToken: transaction.token,
        redirectUrl: transaction.redirect_url,
        midtransOrderId: midtransOrderId,
      },
    });

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: result.items[0].cartId,
      },
    });

    return {
      order: result.order,
      payment,
    };
  }

  async buyNow(
    userId: number,
    addressId: number,
    productId: number,
    quantity: number,
  ) {
    const result = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const address = await tx.address.findFirst({
        where: {
          id: addressId,
          userId,
        },
      });

      if (!address) {
        throw new BadRequestException('Address not found');
      }

      if (product.stock < quantity) {
        throw new BadRequestException(
          `Stock not enough. Available: ${product.stock}`,
        );
      }

      const user = await tx.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const price =
        product.isDiscount && product.discountPrice
          ? Number(product.discountPrice)
          : product.price;

      const totalPrice = price * quantity;

      const order = await tx.order.create({
        data: {
          userId,
          shippingRecipientName: user.name,
          shippingAddress: address.address,
          shippingCity: address.city,
          shippingPostal: address.postal,
          totalPrice,
          status: OrderStatus.PENDING,
        },
      });

      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId,
          quantity,
          price,
        },
      });

      return {
        order,
        user,
      };
    });

    const midtransOrderId = `${result.order.orderId}-${Date.now()}`;

    const transaction = await this.snap.createTransaction({
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: result.order.totalPrice,
      },

      customer_details: {
        first_name: result.user.name,
        email: result.user.email,
      },
    });

    const payment = await this.prisma.payment.create({
      data: {
        orderId: result.order.id,
        amount: result.order.totalPrice,
        status: PaymentStatus.PENDING,
        method: 'Midtrans',

        snapToken: transaction.token,
        redirectUrl: transaction.redirect_url,
        midtransOrderId: midtransOrderId,
      },
    });

    return {
      order: result.order,
      payment,
    };
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
