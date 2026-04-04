import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import midtransClient from 'midtrans-client';
import { MidtransWebhookDto } from './dto/midtrans.dto';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  private snap;
  constructor(private readonly repo: PaymentRepository) {
    this.snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });
  }

  async createPayment(id: number, userId: number) {
    const order = await this.repo.findOrderById(id);

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('Not Your Order');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not pending');
    }

    if (!order.payment) {
      throw new BadRequestException('Payment not initialized');
    }

    // await this.repo.createPayment({
    //   orderId: order.id,
    //   amount: order.totalPrice,
    //   status: 'PENDING',
    //   method: 'MIDTRANS',
    // });

    const transaction = await this.snap.createTransaction({
      transaction_details: {
        order_id: order.orderId,
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

    const order = await this.repo.findOrderByOrderId(order_id);

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.payment?.status === 'SUCCESS') return;

    if (
      transaction_status === 'settlement' ||
      transaction_status === 'capture'
    ) {
      console.log('STATUS:', transaction_status);
      await this.repo.handlesSuccess(order.id);
    }

    if (transaction_status === 'expire' || transaction_status === 'cancel') {
      await this.repo.handleFailed(order.id);
    }

    return { message: 'Webhook handled successfully' };
  }
}
