import { Injectable } from '@nestjs/common';
import { OrderStatus, PaymentStatus, Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const totalUser = await this.prisma.user.count({
      where: { role: Role.BUYER },
    });

    const totalProduct = await this.prisma.product.count();

    const totalOrder = await this.prisma.order.count();

    const payment = await this.prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: PaymentStatus.SUCCESS,
      },
    });

    const pendingOrder = await this.prisma.order.count({
      where: { status: OrderStatus.PENDING },
    });

    const completedOrder = await this.prisma.order.count({
      where: { status: OrderStatus.COMPLETED },
    });

    return {
      totalUser,
      totalProduct,
      totalOrder,
      payment,
      pendingOrder,
      completedOrder,
    };
  }

  async getSalesChart(period: string) {
    const now = new Date();

    let startDate: Date | undefined;

    switch (period) {
      case '7days':
        startDate = new Date();
        startDate.setDate(now.getDate() - 6);
        break;

      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;

      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;

      case 'all':
      default:
        startDate = undefined;
        break;
    }

    const orders = await this.prisma.order.findMany({
      where: {
        status: {
          in: ['PAID', 'COMPLETED'],
        },
        ...(startDate && {
          createdAt: {
            gte: startDate,
          },
        }),
      },
      select: {
        totalPrice: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const groupedData: Record<string, number> = {};

    for (const order of orders) {
      let key = '';

      if (period === 'year') {
        key = new Intl.DateTimeFormat('id-ID', {
          month: 'short',
        }).format(order.createdAt);
      } else if (period === 'all') {
        key = order.createdAt.getFullYear().toString();
      } else {
        key = order.createdAt.toISOString().split('T')[0];
      }

      groupedData[key] = (groupedData[key] || 0) + order.totalPrice;
    }

    return Object.entries(groupedData).map(([date, total]) => ({
      date,
      total,
    }));
  }

  async recentOrder() {
    return this.prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: true,
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        payment: true,
      },
    });
  }

  async findTopProduct() {
    return this.prisma.product.findMany({
      include: {
        weeklyStats: true,
        images: true,
      },
      orderBy: {
        weeklyStats: {
          salesCount: 'desc',
        },
      },
      take: 10,
    });
  }

  async findOrderByStatus() {
    const pending = await this.prisma.order.count({
      where: {
        status: OrderStatus.PENDING,
      },
    });

    const paid = await this.prisma.order.count({
      where: {
        status: OrderStatus.PAID,
      },
    });

    const processing = await this.prisma.order.count({
      where: {
        status: OrderStatus.PROCESSING,
      },
    });
    const shipped = await this.prisma.order.count({
      where: {
        status: OrderStatus.SHIPPED,
      },
    });
    const completed = await this.prisma.order.count({
      where: {
        status: OrderStatus.COMPLETED,
      },
    });
    const cancelled = await this.prisma.order.count({
      where: {
        status: OrderStatus.CANCELLED,
      },
    });

    return {
      data: {
        pending,
        paid,
        processing,
        shipped,
        completed,
        cancelled,
      },
    };
  }

  async findRevenue() {
    const revenue = await this.prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: PaymentStatus.SUCCESS,
      },
    });

    return {
      data: {
        totalRevenue: revenue._sum.amount || 0,
      },
    };
  }

  async findUserStats() {
    const [buyers, admins] = await Promise.all([
      this.prisma.user.count({
        where: {
          role: Role.BUYER,
        },
      }),

      this.prisma.user.count({
        where: {
          role: Role.ADMIN,
        },
      }),
    ]);

    return {
      data: {
        buyers,
        admins,
      },
    };
  }
  findUserByRole(userId: number) {
    return this.prisma.user.findFirst({
      where: { role: Role.BUYER },
    });
  }
}
