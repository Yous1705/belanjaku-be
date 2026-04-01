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
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.BUYER)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getProfile(@Req() req) {
    return this.userService.getProfile(req.user.sub);
  }

  @Get('addresses')
  getAddresses(@Req() req) {
    return this.userService.getAddresses(req.user.sub);
  }

  @Patch('update-addresses')
  updateAddress(@Req() req, @Body() data: UpdateAdressesDto) {
    return this.userService.updateAddress(req.user.sub, data);
  }

  @Delete('delete-addresses')
  deleteProfile(@Req() req) {
    return this.userService.deleteAddress(req.user.sub);
  }

  @Patch('update-profile')
  updateProfile(@Req() req, @Body() data: UpdateUserDto) {
    return this.userService.updateUser(data, req.user.sub);
  }
}
