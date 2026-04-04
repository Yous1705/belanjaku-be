import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';

import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/guard/roles.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUYER)
  @Post(':orderId')
  async createPayment(@Param('orderId') orderId: string, @Req() req: any) {
    const data = await this.paymentService.createPayment(
      Number(orderId),
      req.user.sub,
    );

    return {
      success: true,
      message: 'Payment berhasil dibuat',
      data,
    };
  }

  // webhook midtrans
  // @Post('webhook')
  // async webhook(@Body() body: any) {
  //   console.log('Webhook received:', body);
  //   return this.paymentService.handleWebhook(body);
  // }
}
