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
import { addMoreImagesDto } from './dto/add-more-images.dto';

@Injectable()
export class ProductService {
  constructor(private readonly repo: ProductRepository) {}

  async createProduct(userId: number, data: CreateProductDto) {
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
      category: {
        connect: { id: data.category },
      },
      images: {
        create: data.images?.map((url) => ({
          url,
        })),
      },
      specifications: {
        create: data.specifications?.map((spec) => ({
          key: spec.key,
          value: spec.value,
        })),
      },
    });
  }

  addMoreImages(userId: number, slug: string, dto: addMoreImagesDto) {
    return this.repo.addMoreImages(slug, dto.images);
  }

  async getProductDetail(userId: number, slug: string) {
    return this.repo.findBySlug(slug);
  }

  async updateProduct(userId: number, slug: string, dto: UpdateProductDto) {
    const updateData: Prisma.ProductUpdateInput = {
      name: dto.name,
      price: dto.price,
      description: dto.description,
      stock: dto.stock,
      category: dto.category ? { connect: { id: dto.category } } : undefined,
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

    return await this.repo.updateBySlug(slug, updateData);
  }

  async deleteProduct(userId: number, slug: string) {
    const product = await this.repo.findBySlug(slug);
    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    return this.repo.delete(product.slug);
  }

  async getAllProducts(
    userId: number,
    query: { name?: string; category?: string },
  ) {
    const products = await this.repo.findAllProducts(userId, query);

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      category: p.category?.name ?? 'Uncategorized',
      image: p.images?.[0]?.url || '/images/image.jpg',
      isWishlisted: p.wishlists.length > 0,
    }));
  }
}
