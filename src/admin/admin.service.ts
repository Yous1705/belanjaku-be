import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminRepository } from './admin.repository';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly repo: AdminRepository) {}

  async getSummary(userId: number) {
    const user = await this.repo.findUserByRole(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const summary = await this.repo.getSummary();

    return {
      success: true,
      message: 'dashboard fetched successfully',
      data: {
        totalUser: summary.totalUser,
        totalProduct: summary.totalProduct,
        totalOrder: summary.totalOrder,
        payment: summary.payment,
        pendingOrder: summary.pendingOrder,
        completedOrder: summary.completedOrder,
      },
    };
  }

  async getSalesChart(userId: number, period: string) {
    const user = await this.repo.findUserByRole(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const chart = await this.repo.getSalesChart(period);

    return {
      success: true,
      message: 'Sales Chart fetched successfully',
      data: chart,
    };
  }

  async getRecentOrder(userId: number) {
    const user = await this.repo.findUserByRole(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const orders = await this.repo.recentOrder();

    const total = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    return {
      success: true,
      message: 'Recent Order fethced successfully',
      data: orders,
    };
  }

  async getTopProduct(userId: number) {
    const user = await this.repo.findUserByRole(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const topProduct = await this.repo.findTopProduct();

    return {
      success: true,
      message: 'Top Product fethced successfully',
      data: topProduct,
    };
  }

  async getOrderStatus(userId: number) {
    const user = await this.repo.findUserByRole(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const orderStatus = await this.repo.findOrderByStatus();

    return {
      success: true,
      message: 'Order Status fethced successfully',
      data: orderStatus.data,
    };
  }

  async getRevenue(userId: number) {
    const user = await this.repo.findUserByRole(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const revenue = await this.repo.findRevenue();

    return {
      success: true,
      message: 'Revenue fethced successfully',
      totalRevenue: revenue.data.totalRevenue,
    };
  }

  async getUserStats(userId: number) {
    const user = await this.repo.findUserByRole(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userStats = await this.repo.findUserStats();

    return {
      success: true,
      message: 'User Stats fethced successfully',
      buyer: userStats.data.buyers,
      admin: userStats.data.admins,
    };
  }
}
