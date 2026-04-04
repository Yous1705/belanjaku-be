import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
@Controller('midtrans')
export class MidtransController {
  constructor(private readonly paymentService: PaymentService) {}
  // webhook midtrans
  @Post('webhook')
  async webhook(@Body() body: any) {
    console.log('Webhook received:', body);
    return this.paymentService.handleWebhook(body);
  }
}
