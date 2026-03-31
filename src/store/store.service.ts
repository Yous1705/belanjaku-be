import { User } from './../user/entities/user.entity';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreRepository } from './store.repository';
import { Role } from '@prisma/client';

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
}
