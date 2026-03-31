import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
      },
    });
  }

  getAddress(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        addresses: true,
      },
    });
  }
  async addAddress(userId: number, data: Prisma.AddressCreateWithoutUserInput) {
    const userWithAddress = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { addresses: { take: 1 } },
    });

    const existingAddressId = userWithAddress?.addresses[0]?.id;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        addresses: {
          upsert: {
            where: { id: existingAddressId || 0 },
            update: {
              address: data.address,
              city: data.city,
              postal: data.postal,
            },
            create: {
              address: data.address,
              city: data.city,
              postal: data.postal,
            },
          },
        },
      },
      select: {
        addresses: true,
      },
    });
  }

  update(data: Prisma.UserUpdateInput, where: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.update({ data, where });
  }

  deleteAddress(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        addresses: {
          deleteMany: {},
        },
      },
    });
  }
}
