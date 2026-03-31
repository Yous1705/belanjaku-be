import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import slugify from 'slugify';
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

    const generatedSlug = slugify(data.name, { lower: true, strict: true });

    const isSlugTaken = await this.findBySlug(generatedSlug);
    if (isSlugTaken) {
      throw new BadRequestException(
        'Store dengan nama ini sudah ada, gunakan nama lain',
      );
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        store: {
          upsert: {
            where: { id: existingStoreId },
            update: {
              name: data.name,
              slug: generatedSlug,
              description: data.description,
            },
            create: {
              name: data.name,
              slug: generatedSlug,
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

  findBySlug(slug: string) {
    return this.prisma.store.findUnique({
      where: { slug },
    });
  }

  findStoreProfileAsUser(slug: string) {
    return this.prisma.store.findUnique({
      where: { slug: slug },
      select: {
        name: true,
        slug: true,
        description: true,
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

  delete(userId: number) {
    return this.prisma.store.delete({
      where: { userId },
    });
  }
}
