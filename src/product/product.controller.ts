import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  UsePipes,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/auth/guard/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Role } from '@prisma/client';
import { addMoreImagesDto } from './dto/add-more-images.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create-product')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: 40 * 1024 * 1024,
      },
      fileFilter(req, file, callback) {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(new BadRequestException('Invalid file type'), false);
        }
        callback(null, true);
      },
    }),
  )
  createProduct(
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() data: CreateProductDto,
  ) {
    console.log('Raw Data from Body:', data);
    return this.productService.createProduct(req.user.sub, data, files);
  }

  @Roles(Role.ADMIN, Role.BUYER)
  @Get('search/:name')
  findProductByName(@Req() req, @Param('name') name: string) {
    return this.productService.findProductByName(req.user.sub, name);
  }

  @Roles(Role.ADMIN, Role.BUYER)
  @Get('product-detail/:slug')
  getProductDetail(@Req() req, @Param('slug') slug: string) {
    return this.productService.getProductDetail(req.user.sub, slug);
  }

  @Roles(Role.ADMIN, Role.BUYER)
  @Get('buy-now-product/:slug')
  getProductBySlug(@Req() req, @Param('slug') slug: string) {
    return this.productService.getItemBySlug(slug, req.user.sub);
  }

  @Roles(Role.ADMIN, Role.BUYER)
  @Get('all-products')
  getAllProducts(
    @Req() req,
    @Query('slug') name?: string,
    @Query('category') category?: string,
  ) {
    return this.productService.getAllProducts(req.user.sub, { name, category });
  }

  @Roles(Role.ADMIN, Role.BUYER)
  @Get('hits-product')
  getHitsProduct() {
    return this.productService.getHitsProduct();
  }

  @Patch('update-product/:slug')
  updateProduct(
    @Req() req,
    @Param('slug') slug: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.updateProduct(req.user.sub, slug, dto);
  }

  @Patch('add-images/:slug')
  addMoreImages(
    @Req() req,
    @Param('slug') slug: string,
    @Body() dto: addMoreImagesDto,
  ) {
    return this.productService.addMoreImages(req.user.sub, slug, dto);
  }

  @Delete('delete-product/:slug')
  deleteProduct(@Req() req, @Param('slug') slug: string) {
    return this.productService.deleteProduct(req.user.sub, slug);
  }

  @Roles(Role.ADMIN, Role.BUYER)
  @Get(':productId')
  getProductById(@Param('productId') productId: number) {
    return this.productService.getProductById(productId);
  }
}
