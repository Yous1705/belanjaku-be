import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateAdressesDto } from './dto/update-addresses.dto';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async getProfile(userId: number) {
    const user = await this.repo.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.repo.getProfile(userId);
  }

  async updateAddress(userId: number, data: UpdateAdressesDto) {
    const user = await this.repo.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.repo.addAddress(userId, data);
  }

  async deleteAddress(userId: number) {
    const user = await this.repo.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.repo.deleteAddress(userId);
  }

  async updateUser(dto: UpdateUserDto, userId: number) {
    const user = await this.repo.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const data: Prisma.UserUpdateInput = { ...dto };

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    return this.repo.update(data, { id: userId });
  }

  async getAddresses(userId: number) {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return this.repo.getAddress(userId);
  }
}
