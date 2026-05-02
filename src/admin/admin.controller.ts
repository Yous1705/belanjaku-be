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
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guard/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard/summary')
  getSummary(@Req() req) {
    return this.adminService.getSummary(req.user.sub);
  }

  @Get('dashboard/sales-chart')
  getSalesChart(@Req() req, @Query('period') period: string) {
    return this.adminService.getSalesChart(req.user.sub, period);
  }

  @Get('dashboard/recent-orders')
  getRecentOrder(@Req() req) {
    return this.adminService.getRecentOrder(req.user.sub);
  }

  @Get('dashboard/top-product')
  getTopProduct(@Req() req) {
    return this.adminService.getTopProduct(req.user.sub);
  }

  @Get('dashboard/order-status')
  getOrderStatus(@Req() req) {
    return this.adminService.getOrderStatus(req.user.sub);
  }

  @Get('dashboard/revenue')
  getRevenue(@Req() req) {
    return this.adminService.getRevenue(req.user.sub);
  }

  @Get('dashboard/user-stats')
  getUserStats(@Req() req) {
    return this.adminService.getUserStats(req.user.sub);
  }
}
