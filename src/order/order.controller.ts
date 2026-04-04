import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BUYER)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  checout(@Req() req) {
    return this.orderService.checkout(req.user.sub);
  }

  @Post('cancel/:id')
  cancelOrder(@Param('id') id: string) {
    return this.orderService.cancelOrder(+id);
  }

  @Get('my-orders')
  getMyOrders(@Req() req) {
    return this.orderService.findAllMyOrders(req.user.sub);
  }

  // async checkout(@Req() req) {
  //   try {
  //     const order = await this.orderService.checkout(req.user.sub);
  //     return {
  //       success: true,
  //       message: 'Checkout successful',
  //       data: order,
  //     };
  //   } catch (e) {
  //     return {
  //       success: false,
  //       message: 'Checkout failed: ',
  //     };
  //   }
  // }
}
