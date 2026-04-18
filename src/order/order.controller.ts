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

  @Get('pending')
  getPendingOrders(@Req() req) {
    return this.orderService.findMyOrderByPendingStatus(req.user.sub);
  }
}
