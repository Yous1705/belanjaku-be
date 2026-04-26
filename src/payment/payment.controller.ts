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
  async resumePayment(@Param('orderId') orderId: number, @Req() req) {
    const userId = req.user.id;
    return this.paymentService.resumePayment(orderId, userId);
  }

  // webhook midtrans
  // @Post('webhook')
  // async webhook(@Body() body: any) {
  //   console.log('Webhook received:', body);
  //   return this.paymentService.handleWebhook(body);
  // }
}
