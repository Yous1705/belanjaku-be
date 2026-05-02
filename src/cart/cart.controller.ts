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
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BUYER || Role.ADMIN)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('my-cart')
  getCart(@Req() req) {
    return this.cartService.getCart(req.user.sub);
  }

  @Post('add-item')
  addItemToCart(
    @Req() req,
    @Body('slug') slug: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.addItemToCart(req.user.sub, slug, quantity);
  }

  @Delete('remove-item/:slug')
  removeItemFromCart(@Req() req, @Param('slug') slug: string) {
    return this.cartService.removeItemFromCart(req.user.sub, slug);
  }
}
