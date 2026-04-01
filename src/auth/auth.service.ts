import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { AuthRepository } from './auth.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterSellerDto } from './dto/register-seller.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createBuyer(dto: RegisterUserDto) {
    await this.ensureEmailUnique(dto.email);
    const hashed = await bcrypt.hash(dto.password, 10);

    return this.repo.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
    });
  }

  async createAdmin(dto: RegisterSellerDto) {
    await this.ensureEmailUnique(dto.email);
    const hashed = await bcrypt.hash(dto.password, 10);

    return this.repo.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: Role.ADMIN,
    });
  }

  async login(data: { email; password }) {
    const user = await this.repo.findByEmail(data.email);

    if (!user) {
      throw new BadRequestException('Invalid email');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Invalid password');
    }

    const payload = {
      sub: user.id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private async ensureEmailUnique(email: string) {
    const exist = await this.repo.findByEmail(email);
    if (exist) {
      throw new BadRequestException('Email already exists');
    }
  }
}
