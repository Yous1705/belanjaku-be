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
import { UserService } from './user.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateAdressesDto } from './dto/update-addresses.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER, Role.BUYER)
  @Get('profile')
  getProfile(@Req() req) {
    return this.userService.getProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER, Role.BUYER)
  @Get('addresses')
  getAddresses(@Req() req) {
    return this.userService.getAddresses(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER, Role.BUYER)
  @Patch('update-addresses')
  updateProfile(@Req() req, @Body() data: UpdateAdressesDto) {
    return this.userService.updateAddress(req.user.sub, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER, Role.BUYER)
  @Delete('delete-addresses')
  deleteProfile(@Req() req) {
    return this.userService.deleteAddress(req.user.sub);
  }
}
