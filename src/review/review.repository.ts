import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMyOrderByOrderId(userId: number, orderId: number) {
    return this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  findMyReviewByProductId(userId: number, productId: number) {
    return this.prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    });
  }

  create(data: Prisma.ReviewCreateInput) {
    return this.prisma.review.create({
      data: {
        ...data,
      },
    });
  }
}
