import { Injectable } from '@nestjs/common';
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
}
