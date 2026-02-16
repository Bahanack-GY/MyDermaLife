import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseUUIDPipe,
  BadRequestException,
  Req,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import * as express from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { RoutinesService } from '../routines/routines.service';
import { UploadsService } from '../uploads/uploads.service';
import { productMulterOptions } from '../uploads/multer-config';
import { UploadProductImageDto } from '../uploads/dto/upload-product-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { ProductResponseDto, PaginatedProductsResponseDto } from './dto/product-response.dto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly routinesService: RoutinesService,
    private readonly uploadsService: UploadsService,
  ) {}

  // ==================== PUBLIC ENDPOINTS ====================

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all products', description: 'Public endpoint to list products with filters and pagination' })
  @ApiResponse({ status: 200, description: 'List of products', type: PaginatedProductsResponseDto })
  async findAll(
    @Query() query: QueryProductDto,
    @Req() req: express.Request,
  ): Promise<PaginatedProductsResponseDto> {
    const context = {
      userId: (req as any).user?.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      sessionToken: req.headers['x-session-token'] as string | undefined,
    };
    const result = await this.productsService.findAll(query, context);
    return {
      data: result.data.map((product) => this.formatProductResponse(product)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Get featured products', description: 'Public endpoint for landing page featured products' })
  @ApiResponse({ status: 200, description: 'List of featured products', type: [ProductResponseDto] })
  async findFeatured(): Promise<ProductResponseDto[]> {
    const products = await this.productsService.findFeatured();
    return products.map((product) => this.formatProductResponse(product));
  }

  @Get('new-arrivals')
  @Public()
  @ApiOperation({ summary: 'Get new arrivals', description: 'Public endpoint for new arrival products' })
  @ApiResponse({ status: 200, description: 'List of new arrival products', type: [ProductResponseDto] })
  async findNewArrivals(): Promise<ProductResponseDto[]> {
    const products = await this.productsService.findNewArrivals();
    return products.map((product) => this.formatProductResponse(product));
  }

  @Get('best-sellers')
  @Public()
  @ApiOperation({ summary: 'Get best sellers', description: 'Public endpoint for best-selling products' })
  @ApiResponse({ status: 200, description: 'List of best-selling products', type: [ProductResponseDto] })
  async findBestSellers(): Promise<ProductResponseDto[]> {
    const products = await this.productsService.findBestSellers();
    return products.map((product) => this.formatProductResponse(product));
  }

  @Get('by-category/:slug')
  @Public()
  @ApiOperation({ summary: 'Get products by category slug', description: 'Public endpoint to get products by category slug' })
  @ApiParam({ name: 'slug', description: 'Category slug', example: 'hydratants-visage' })
  @ApiResponse({ status: 200, description: 'List of products in the category', type: PaginatedProductsResponseDto })
  async findByCategory(
    @Param('slug') slug: string,
    @Query() query: QueryProductDto,
  ): Promise<PaginatedProductsResponseDto> {
    const result = await this.productsService.findByCategory(slug, query);
    return {
      ...result,
      data: result.data.map((product) => this.formatProductResponse(product)),
    };
  }

  @Get('search-analytics')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get search analytics', description: 'Admin endpoint returning top searches and zero-result searches' })
  @ApiResponse({ status: 200, description: 'Search analytics data' })
  async getSearchAnalytics(
    @Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.productsService.getSearchAnalytics(days, limit);
  }

  @Get('search-logs')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get search logs', description: 'Admin endpoint to browse raw search log entries with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated search logs' })
  async getSearchLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('userId') userId?: string,
    @Query('zeroResults') zeroResults?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.productsService.getSearchLogs({
      page,
      limit,
      search,
      userId,
      zeroResults: zeroResults === 'true',
      from,
      to,
    });
  }

  @Get(':idOrSlug')
  @Public()
  @ApiOperation({ summary: 'Get product by ID or slug', description: 'Public endpoint to get a single product by UUID or slug' })
  @ApiParam({ name: 'idOrSlug', description: 'Product UUID or slug' })
  @ApiResponse({ status: 200, description: 'Product detail', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('idOrSlug') idOrSlug: string): Promise<ProductResponseDto> {
    const product = UUID_REGEX.test(idOrSlug)
      ? await this.productsService.findById(idOrSlug)
      : await this.productsService.findBySlug(idOrSlug);

    const routines = await this.routinesService.findByProductId(product.id);
    const response = this.formatProductResponse(product);
    response.routines = routines.map((r: any) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      imageUrl: r.imageUrl,
      products: r.products
        ? r.products.map((rp: any) => ({
            stepOrder: rp.stepOrder,
            stepLabel: rp.stepLabel,
            product: rp.product
              ? {
                  id: rp.product.id,
                  name: rp.product.name,
                  slug: rp.product.slug,
                  price: rp.product.price ? parseFloat(rp.product.price) : 0,
                  primaryImage: rp.product.images?.[0]?.imageUrl || null,
                }
              : null,
          }))
        : [],
    }));

    return response;
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CATALOG_MANAGER)
  @UseInterceptors(FilesInterceptor('images', 10, productMulterOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create product', description: 'Admin endpoint to create a new product. Supports multipart/form-data with optional image uploads.' })
  @ApiResponse({ status: 201, description: 'Product created', type: ProductResponseDto })
  @ApiResponse({ status: 409, description: 'SKU or slug already exists' })
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() currentUser: any,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.create(dto, currentUser.id);

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await this.uploadsService.saveProductImage(
          product.id,
          files[i],
          undefined,
          i === 0,
          i,
        );
      }
      // Re-fetch product with images
      const updated = await this.productsService.findById(product.id);
      return this.formatProductResponse(updated);
    }

    return this.formatProductResponse(product);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CATALOG_MANAGER)
  @UseInterceptors(FilesInterceptor('images', 10, productMulterOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update product', description: 'Admin endpoint to update a product. Supports multipart/form-data with optional image uploads.' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product updated', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.update(id, dto);

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await this.uploadsService.saveProductImage(
          id,
          files[i],
          undefined,
          false,
          i,
        );
      }
      // Re-fetch product with images
      const updated = await this.productsService.findById(id);
      return this.formatProductResponse(updated);
    }

    return this.formatProductResponse(product);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CATALOG_MANAGER)
  @ApiOperation({ summary: 'Delete product', description: 'Admin endpoint to soft-delete a product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.productsService.delete(id);
    return { message: 'Product deleted successfully' };
  }

  // ==================== IMAGE ENDPOINTS ====================

  @Post(':id/images')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CATALOG_MANAGER)
  @UseInterceptors(FileInterceptor('image', productMulterOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload product image', description: 'Admin endpoint to upload an image for a product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        altText: { type: 'string' },
        isPrimary: { type: 'boolean' },
        sortOrder: { type: 'number' },
      },
      required: ['image'],
    },
  })
  @ApiResponse({ status: 201, description: 'Image uploaded' })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadProductImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    // Verify product exists
    await this.productsService.findById(id);
    const image = await this.uploadsService.saveProductImage(
      id,
      file,
      dto.altText,
      dto.isPrimary,
      dto.sortOrder,
    );
    return {
      id: image.id,
      imageUrl: image.imageUrl,
      altText: image.altText,
      isPrimary: image.isPrimary,
      sortOrder: image.sortOrder,
    };
  }

  @Delete(':id/images/:imageId')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CATALOG_MANAGER)
  @ApiOperation({ summary: 'Delete product image', description: 'Admin endpoint to delete a product image' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiParam({ name: 'imageId', description: 'Image UUID' })
  @ApiResponse({ status: 200, description: 'Image deleted' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async deleteImage(
    @Param('id', ParseUUIDPipe) _id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ): Promise<{ message: string }> {
    await this.uploadsService.deleteProductImage(imageId);
    return { message: 'Product image deleted successfully' };
  }

  // ==================== RESPONSE FORMATTER ====================

  private formatProductResponse(product: any): ProductResponseDto {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      brandName: product.brandName,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
            description: product.category.description,
            imageUrl: product.category.imageUrl,
            parentCategory: product.category.parentCategory
              ? {
                  id: product.category.parentCategory.id,
                  name: product.category.parentCategory.name,
                  slug: product.category.parentCategory.slug,
                }
              : undefined,
          }
        : undefined,
      price: product.price ? parseFloat(product.price) : 0,
      compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : undefined,
      requiresPrescription: product.requiresPrescription,
      ingredients: product.ingredients,
      usageInstructions: product.usageInstructions,
      warnings: product.warnings,
      benefits: product.benefits,
      skinTypes: product.skinTypes,
      conditionsTreated: product.conditionsTreated,
      costPrice: product.costPrice ? parseFloat(product.costPrice) : undefined,
      isPrescriptionOnly: product.isPrescriptionOnly,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isBestSeller: product.isBestSeller,
      rating: product.rating ? parseFloat(product.rating) : 0,
      totalReviews: product.totalReviews,
      totalSales: product.totalSales,
      weightGrams: product.weightGrams,
      dimensions: product.dimensions,
      tags: product.tags,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      images: product.images
        ? product.images.map((img: any) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            altText: img.altText,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          }))
        : undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

}
