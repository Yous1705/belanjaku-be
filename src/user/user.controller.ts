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
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Roles } from 'src/auth/guard/roles.decorator';
import { Role } from '@prisma/client';
import { AddAdressesDto } from './dto/add-addresses.dto';
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

  @Post('add-addresses')
  addAddress(@Req() req, @Body() data: AddAdressesDto) {
    return this.userService.addAddress(req.user.sub, data);
  }

  @Put('set-main-address')
  setMain(@Req() req, @Body('addressId') addressId: number) {
    return this.userService.setMainAddress(Number(addressId), req.user.sub);
  }

  @Delete('delete-address')
  deleteAddress(@Req() req, @Body('addressId') addressId: number) {
    return this.userService.deleteAddress(req.user.sub, addressId);
  }

  @Patch('update-profile')
  updateProfile(@Req() req, @Body() data: UpdateUserDto) {
    return this.userService.updateUser(data, req.user.sub);
  }
}
