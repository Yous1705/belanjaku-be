import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, data: Prisma.StoreCreateWithoutUserInput) {
    const userWithStore = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { store: true },
    });

    const existingStoreId = userWithStore?.store?.id;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        store: {
          upsert: {
            where: { id: existingStoreId },
            update: {
              name: data.name,
              description: data.description,
            },
            create: {
              name: data.name,
              description: data.description,
            },
          },
        },
      },
      select: {
        store: true,
      },
    });
  }

  findStoreByUserId(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        store: true,
      },
    });
  }

  findByUserId(userId: number) {
    return this.prisma.store.findUnique({
      where: { userId },
    });
  }

  findByUserRole(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
      },
    });
  }
}
