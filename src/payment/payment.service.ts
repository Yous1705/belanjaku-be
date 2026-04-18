import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import midtransClient from 'midtrans-client';
import { MidtransWebhookDto } from './dto/midtrans.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentService {
  private snap;
  constructor(
    private readonly repo: PaymentRepository,
    private readonly prisma: PrismaService,
  ) {
    this.snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });
  }

  async createPayment(id: number, userId: number) {
    const order = await this.repo.findOrderById(id);

    if (!order) throw new BadRequestException('Order not found');
    if (order.userId !== userId)
      throw new BadRequestException('Not Your Order');
    if (order.status !== 'PENDING')
      throw new BadRequestException('Order is already processed');

    const midtransOrderId = `${order.orderId}-${Date.now()}`;

    const transaction = await this.snap.createTransaction({
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: order.totalPrice,
      },
      customer_details: {
        email: order.user.email,
        first_name: order.user.name,
      },
    });

    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    };
  }

  async handleWebhook(payload: MidtransWebhookDto) {
    const { order_id, transaction_status } = payload;

    const originalOrderId = order_id.split('-')[0];

    const order = await this.prisma.order.findUnique({
      where: { orderId: originalOrderId },
    });

    if (!order) throw new BadRequestException('Order not found');

    if (order.status === OrderStatus.PAID) return { message: 'Already paid' };

    if (
      transaction_status === 'settlement' ||
      transaction_status === 'capture'
    ) {
      await this.repo.handlesSuccess(order.id);
    } else if (
      transaction_status === 'deny' ||
      transaction_status === 'cancel' ||
      transaction_status === 'expire'
    ) {
      await this.repo.handleFailed(order.id);
    }
  }
}
