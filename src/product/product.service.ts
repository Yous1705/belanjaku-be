import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from './product.repository';
import { connect } from 'http2';
import { Prisma } from '@prisma/client';
import slugify from 'slugify';

@Injectable()
export class ProductService {
  constructor(private readonly repo: ProductRepository) {}

  async createProduct(userId: number, data: CreateProductDto) {
    const store = await this.repo.findStoreByUserId(userId);

    if (!store) {
      console.log(store);
      throw new NotFoundException('Anda belum memiliki toko');
    }

    const generatedSlug = slugify(data.name, { lower: true, strict: true });

    const isSlugTaken = await this.repo.findBySlug(generatedSlug);
    if (isSlugTaken) {
      throw new BadRequestException(
        'Produk dengan nama ini sudah ada, gunakan nama lain',
      );
    }

    return this.repo.create({
      name: data.name,
      slug: generatedSlug,
      price: data.price,
      description: data.description,
      stock: data.stock,
      store: {
        connect: { id: store.id },
      },
    });
  }

  async getAllMyProducts(userId: number) {
    const store = await this.repo.findStoreByUserId(userId);

    if (!store) {
      throw new NotFoundException('Anda belum memiliki toko');
    }

    return this.repo.getAllMyProduct(userId);
  }

  async getProductDetail(userId: number, slug: string) {
    const store = await this.repo.findStoreByUserId(userId);

    if (!store) {
      throw new NotFoundException('Anda belum memiliki toko');
    }

    return this.repo.findBySlug(slug);
  }

  async updateProduct(userId: number, slug: string, dto: UpdateProductDto) {
    const store = await this.repo.findStoreByUserId(userId);

    if (!store) {
      throw new NotFoundException('Anda belum memiliki toko');
    }

    const updateData: Prisma.ProductUpdateInput = {
      name: dto.name,
      price: dto.price,
      description: dto.description,
      stock: dto.stock,
    };

    if (dto.name) {
      const newSlug = slugify(dto.name, { lower: true });

      if (newSlug !== slug) {
        const isSlugTaken = await this.repo.findBySlug(newSlug);
        if (isSlugTaken) {
          throw new BadRequestException(
            'Slug sudah digunakan, silakan gunakan nama lain',
          );
        }
        updateData.slug = newSlug;
      }
    }

    return await this.repo.updateBySlug(slug, store.id, updateData);
  }

  async deleteProduct(userId: number, slug: string) {
    const store = await this.repo.findStoreByUserId(userId);

    if (!store) {
      throw new NotFoundException('Anda belum memiliki toko');
    }

    const product = await this.repo.findBySlug(slug);
    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    return this.repo.delete(product.slug, store.id);
  }

  getAllProducts() {
    return this.repo.findAllProducts();
  }
}
