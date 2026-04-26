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
  ) {}

  async resumePayment(orderId: number, userId: number) {
    const payment = await this.repo.findOrder(orderId, userId);

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException('Order already paid');
    }

    const isExpired =
      payment.expiresAt && new Date(payment.expiresAt) < new Date();

    if (!isExpired) {
      return {
        token: payment.snapToken,
        redirect_url: payment.redirectUrl,
        reused: true,
      };
    }

    const newMidtransOrderId = `${payment.order.orderId}-${Date.now()}`;

    const transaction = await this.snap.createTransaction({
      transaction_details: {
        order_id: newMidtransOrderId,
        gross_amount: payment.amount,
      },

      customer_details: {
        first_name: payment.order.user.name,
        email: payment.order.user.email,
      },

      expiry: {
        unit: 'minute',
        duration: 15,
      },
    });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        snapToken: transaction.token,
        redirectUrl: transaction.redirect_url,
        midtransOrderId: newMidtransOrderId,
        expiresAt,
      },
    });

    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      reused: false,
    };
  }

  async handleWebhook(payload: MidtransWebhookDto) {
    const { order_id, transaction_status } = payload;

    const payment = await this.prisma.payment.findUnique({
      where: {
        midtransOrderId: order_id,
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.order.status === OrderStatus.PAID) {
      return {
        message: 'Already paid',
      };
    }

    if (
      transaction_status === 'settlement' ||
      transaction_status === 'capture'
    ) {
      await this.repo.handlesSuccess(payment.order.id);
    } else if (
      transaction_status === 'deny' ||
      transaction_status === 'cancel' ||
      transaction_status === 'expire'
    ) {
      await this.repo.handleFailed(payment.order.id);
    }

    return {
      message: 'Webhook handled',
    };
  }
}
