import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { profile } from 'console';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SELLER, Role.BUYER)
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post('create-store')
  createStore(@Req() req, @Body() data: CreateStoreDto) {
    return this.storeService.createStore(req.user.sub, data);
  }

  @Get('store-profile')
  getStore(@Req() req) {
    return this.storeService.getStore(req.user.sub);
  }
}
