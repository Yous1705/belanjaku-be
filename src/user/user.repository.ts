import { UpdateAddresses } from './dto/update-addresses.dto';
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
    return this.prisma.address.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  getMainAddress(userId: number) {
    return this.prisma.address.findFirst({
      where: {
        userId,
      },
    });
  }

  setMainAddress(id: number, userId: number) {
    return this.prisma.$transaction([
      this.prisma.address.updateMany({
        where: {
          userId: userId,
        },
        data: {
          isMain: false,
        },
      }),
      this.prisma.address.update({
        where: { id: id },
        data: {
          isMain: true,
        },
      }),
    ]);
  }

  update(data: Prisma.UserUpdateInput, where: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.update({ data, where });
  }

  UpdateAddresses(
    data: Prisma.AddressUpdateInput,
    where: Prisma.AddressWhereUniqueInput,
  ) {
    return this.prisma.address.update({ data, where });
  }

  deleteAddress(addresId: number) {
    return this.prisma.address.delete({
      where: { id: addresId },
    });
  }
}
