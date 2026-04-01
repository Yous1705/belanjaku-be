import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterSellerDto } from './dto/register-seller.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  create(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.createBuyer(registerUserDto);
  }

  @Post('register/admin')
  createAdmin(@Body() registerSellerDto: RegisterSellerDto) {
    return this.authService.createAdmin(registerSellerDto);
  }

  @Post('login')
  login(@Body() data: { email: string; password: string }) {
    return this.authService.login(data);
  }
}
