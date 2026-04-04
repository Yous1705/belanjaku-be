import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentRepository } from './payment.repository';
import { MidtransController } from './midtrans.controller';

@Module({
  controllers: [PaymentController, MidtransController],
  providers: [PaymentService, PaymentRepository],
})
export class PaymentModule {}
