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
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BUYER)
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('order/:orderId')
  findMyOrderByOrderId(@Req() req, @Param('orderId') orderId: number) {
    return this.reviewService.findMyOrderByOrderId(
      req.user.sub,
      Number(orderId),
    );
  }

  @Post('product/:productId/order/:orderId')
  reviewProduct(
    @Req() req,
    @Param('productId') productId: number,
    @Param('orderId') orderId: number,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.reviewOrder(
      req.user.sub,
      productId,
      orderId,
      dto,
    );
  }

  @Get('my-review')
  findMyReview(@Req() req) {
    return this.reviewService.findMyReview(req.user.sub);
  }
}
