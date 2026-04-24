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
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/auth/guard/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Role } from '@prisma/client';
import { addMoreImagesDto } from './dto/add-more-images.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create-product')
  createProduct(@Req() req, @Body() data: CreateProductDto) {
    return this.productService.createProduct(req.user.sub, data);
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
}
