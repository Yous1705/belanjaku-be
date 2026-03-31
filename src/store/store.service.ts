import { User } from './../user/entities/user.entity';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreRepository } from './store.repository';
import { Role } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class StoreService {
  constructor(private readonly repo: StoreRepository) {}

  async createStore(userId: number, data: CreateStoreDto) {
    const userRole = await this.repo.findByUserRole(userId);

    if (userRole?.role !== Role.SELLER) {
      throw new ForbiddenException('Only sellers can create a store');
    }
    return this.repo.create(userId, data);
  }

  async getStore(userId: number) {
    const userRole = await this.repo.findByUserRole(userId);
    if (userRole?.role !== Role.SELLER) {
      throw new ForbiddenException('Only sellers can create a store');
    }

    return this.repo.findStoreByUserId(userId);
  }

  findStoreProfileAsUser(slug: string) {
    return this.repo.findStoreProfileAsUser(slug);
  }

  async deleteMyStore(userId: number) {
    const store = await this.repo.findStoreByUserId(userId);

    if (!store) {
      throw new ForbiddenException('Anda belum memiliki toko');
    }

    return this.repo.delete(userId);
  }
}
