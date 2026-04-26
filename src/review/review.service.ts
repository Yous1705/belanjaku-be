import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewRepository } from './review.repository';
import { OrderStatus } from '@prisma/client/wasm';

@Injectable()
export class ReviewService {
  constructor(private readonly repo: ReviewRepository) {}

  async reviewOrder(
    userId: number,
    productId: number,
    orderId: number,
    createReviewDto: CreateReviewDto,
  ) {
    const order = await this.repo.findMyOrderByOrderId(userId, orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException(
        'Review can only be added after order completed',
      );
    }

    const existingReview = await this.repo.findMyReviewByProductId(
      userId,
      productId,
    );

    if (existingReview) {
      throw new BadRequestException('You already reviewed this product');
    }

    return this.repo.create({
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      user: {
        connect: {
          id: userId,
        },
      },
      product: {
        connect: {
          id: productId,
        },
      },
    });
  }

  findMyOrderByOrderId(userId: number, orderId: number) {
    return this.repo.findMyOrderByOrderId(userId, orderId);
  }
}
