import { BadRequestException, Injectable } from '@nestjs/common';

import { UserRepository } from './user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { AddAdressesDto } from './dto/add-addresses.dto';

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

  async addAddress(userId: number, data: AddAdressesDto) {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const address = await this.repo.getAddress(userId);

    if (address && address.addresses.length >= 5) {
      throw new BadRequestException(
        'Maximum address limit reached (5 addresses)',
      );
    }

    const addressData = await this.repo.addAddress(userId, data);

    return {
      id: addressData.id,
      isMain: addressData.isMain,
      address: addressData.address,
      city: addressData.city,
      postal: addressData.postal,
    };
  }

  async deleteAddress(userId: number, addressId: number) {
    const user = await this.repo.findById(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return this.repo.deleteAddress(addressId);
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

  async setMainAddress(addressId: number, userId: number) {
    return this.repo.setMainAddress(addressId, userId);
  }
}
