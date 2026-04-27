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
import { OrderStatus, Role } from '@prisma/client';
import { userInfo } from 'os';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BUYER)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout-all')
  checkoutAll(@Req() req, @Body('addressId') addressId: number) {
    return this.orderService.checkoutCartItem(req.user.sub, addressId);
  }

  @Post('cancel/:id')
  cancelOrder(@Param('id') id: string) {
    return this.orderService.cancelOrder(+id);
  }

  @Post('buy-now')
  buyNow(
    @Req() req,
    @Body('productId') productId: number,
    @Body('addressId') addressId: number,
    @Body('quantity') quantity: number,
  ) {
    return this.orderService.buyNow(
      req.user.sub,
      Number(productId),
      Number(addressId),
      Number(quantity),
    );
  }

  @Get('my-orders')
  getMyOrders(@Req() req) {
    return this.orderService.findAllMyOrders(req.user.sub);
  }

  @Get('my-order/:id')
  getMyOrderDetail(@Req() req, @Param('id') id: number) {
    return this.orderService.getOrderDetail(Number(id), req.user.sub);
  }

  @Get('pending')
  getPendingOrders(@Req() req) {
    return this.orderService.findMyOrderByPendingStatus(req.user.sub);
  }

  @Get('status/:status')
  getMyOrderByStatus(@Req() req, @Param('status') status: OrderStatus) {
    return this.orderService.findMyOrderByStatus(req.user.sub, status);
  }

  @Patch('update-order-status/:id')
  updateOrderStatus(
    @Req() req,
    @Body() dto: UpdateOrderDto,
    @Param('id') id: number,
  ) {
    return this.orderService.updateOrderStatus(id, dto, req.user.sub);
  }
}
