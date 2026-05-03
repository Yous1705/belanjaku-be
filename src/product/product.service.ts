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
import { ImagekitService } from 'src/imagekit/imagekit.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly repo: ProductRepository,
    private readonly imageKitService: ImagekitService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async createProduct(
    userId: number,
    data: CreateProductDto,
    files: Express.Multer.File[],
  ) {
    const generatedSlug = slugify(data.name, { lower: true, strict: true });

    const isSlugTaken = await this.repo.findBySlug(generatedSlug);
    if (isSlugTaken) {
      throw new BadRequestException(
        'Produk dengan nama ini sudah ada, gunakan nama lain',
      );
    }

    const imageUrls = await this.cloudinary.uploadMultiple(files);

    const specsArray = Array.isArray(data.specifications)
      ? data.specifications
      : [];

    const cleanSpecifications = specsArray
      .filter((spec) => spec && spec.key && spec.value) // Pastikan objek dan property ada
      .map((spec) => ({
        key: String(spec.key).trim(),
        value: String(spec.value).trim(),
      }))
      .filter((spec) => spec.key !== '' && spec.value !== '');

    console.log('Final Clean Specs for Prisma:', cleanSpecifications);

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
        create: imageUrls.map((url) => ({ url })),
      },
      specifications:
        cleanSpecifications.length > 0
          ? {
              create: cleanSpecifications,
            }
          : undefined,
    });
  }

  addMoreImages(userId: number, slug: string, dto: addMoreImagesDto) {
    return this.repo.addMoreImages(slug, dto.images);
  }

  async getProductDetail(userId: number, slug: string) {
    const product = await this.repo.findBySlug(slug);

    if (!product) throw new NotFoundException();

    const now = new Date();
    const isExpired = product.discountExpiry && product.discountExpiry < now;

    return {
      ...product,
      currentPrice: isExpired
        ? product.price
        : (product.discountPrice ?? product.price),
      isDiscountActive: product.isDiscount && !isExpired,
    };
  }

  async updateProduct(userId: number, slug: string, dto: UpdateProductDto) {
    const existingProduct = await this.repo.findBySlug(slug);
    if (!existingProduct) throw new NotFoundException('Produk tidak ditemukan');

    let expiryDate: Date | undefined | null = undefined;
    const currentPrice = dto.price ?? existingProduct.price;
    let finalDiscountPrice: number | undefined | null = dto.discountPrice;

    if (dto.discountPercent !== undefined && dto.discountPercent !== null) {
      finalDiscountPrice =
        currentPrice - currentPrice * (dto.discountPercent / 100);
    }

    if (dto.discountDays !== undefined) {
      if (dto.discountDays === 0) {
        expiryDate = null;
        finalDiscountPrice = null;
      } else {
        const date = new Date();
        date.setDate(date.getDate() + dto.discountDays);
        date.setHours(23, 59, 59, 999);
        expiryDate = date;
      }
    }

    const updateData: Prisma.ProductUpdateInput = {
      name: dto.name,
      price: dto.price,
      category: dto.category ? { connect: { id: dto.category } } : undefined,
      description: dto.description,
      stock: dto.stock,
      discountPrice: finalDiscountPrice,
      discountExpiry: expiryDate,
      isDiscount:
        finalDiscountPrice && finalDiscountPrice < currentPrice ? true : false,
    };

    if (dto.specifications) {
      updateData.specifications = {
        deleteMany: {},
        create: dto.specifications.map((spec) => ({
          key: spec.key,
          value: spec.value,
        })),
      };
    }

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

  async findProductByName(userId: number, name: string) {
    const product = await this.repo.findProductByName(name);
    if (!product) throw new NotFoundException('Produk tidak ditemukan');

    const now = new Date();

    const item = product.map((p) => {
      const isExpired = p.discountExpiry && p.discountExpiry < now;
      const showDiscount = p.isDiscount && !isExpired;
      return {
        id: p.id,
        name: p.name,
        images: p.images.map((i) => i.url),
        slug: p.slug,
        price: p.price,
        reviews: {
          rating:
            p.reviews.reduce((acc, review) => acc + review.rating, 0) /
            p.reviews.length,
        },
        displayPrice: showDiscount ? Number(p.discountPrice) : p.price,
        discountPrice: showDiscount ? Number(p.discountPrice) : null,
        isDiscount: showDiscount,
      };
    });

    return item;
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

    if (!products) throw new NotFoundException();

    const now = new Date();

    return products.map((p) => {
      const isExpired = p.discountExpiry && p.discountExpiry < now;

      const showDiscount = p.isDiscount && !isExpired;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        stock: p.stock,
        description: p.description,
        price: p.price,
        reviews: {
          rating:
            p.reviews.reduce((acc, review) => acc + review.rating, 0) /
            p.reviews.length,
        },
        displayPrice: showDiscount ? Number(p.discountPrice) : p.price,
        discountPrice: showDiscount ? Number(p.discountPrice) : null,
        isDiscount: showDiscount,
        category: p.category?.name ?? 'Uncategorized',
        image: p.images?.[0]?.url || '/images/image.jpg',
        isWishlisted: p.wishlists.length > 0,
        discountExpiry: p.discountExpiry,
      };
    });
  }

  async getItemBySlug(slug: string, userId: number) {
    return this.repo.findBySlug(slug);
  }

  async getHitsProduct() {
    const products = await this.repo.getHitsProduct();

    if (!products) throw new NotFoundException();

    const now = new Date();

    return products.map((p) => {
      const isExpired = p.discountExpiry && p.discountExpiry < now;
      const showDiscount = p.isDiscount && !isExpired;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        displayPrice: showDiscount ? Number(p.discountPrice) : p.price,
        discountPrice: showDiscount ? Number(p.discountPrice) : null,
        isDiscount: showDiscount,
        category: p.category?.name ?? 'Uncategorized',
        image: p.images?.[0]?.url || '/images/image.jpg',
        isWishlisted: p.wishlists.length > 0,
        discountExpiry: p.discountExpiry,
      };
    });
  }

  async getProductById(productId: number) {
    const product = await this.repo.findProductById(productId);

    if (!product) {
      throw new BadRequestException('Invalid ProductId');
    }

    const now = new Date();

    const isExpired = product.discountExpiry && product.discountExpiry < now;

    const showDiscount = product.isDiscount && !isExpired;

    let discountPercent: number | null = null;

    if (showDiscount && product.discountPrice !== null) {
      discountPercent = Math.round(
        ((product.price - Number(product.discountPrice)) / product.price) * 100,
      );
    }

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      images: product.images,
      description: product.description,
      category: product.category?.name,
      stock: product.stock,
      price: product.price,

      discountPercent,

      displayPrice: showDiscount
        ? Number(product.discountPrice)
        : product.price,

      discountPrice: showDiscount ? Number(product.discountPrice) : null,
    };
  }
}
