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
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BUYER)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get('my-wishlist')
  getMyWishlist(@Req() req) {
    return this.wishlistService.getMyWishlist(req.user.sub);
  }

  @Post('toggle/:slug')
  toggleWishlist(@Req() req, @Param('slug') slug: string) {
    return this.wishlistService.toggleWishlist(req.user.sub, slug);
  }
}
