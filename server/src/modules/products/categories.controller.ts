import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { UploadsService } from '../uploads/uploads.service';
import { categoryMulterOptions } from '../uploads/multer-config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly uploadsService: UploadsService,
  ) {}

  // ==================== PUBLIC ENDPOINTS ====================

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all categories', description: 'Public endpoint to list categories with subcategories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return categories.map((cat) => this.formatCategoryResponse(cat));
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get category by ID', description: 'Public endpoint to get a single category with subcategories and their products' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category detail' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const category = await this.categoriesService.findById(id);
    return this.formatCategoryDetailResponse(category);
  }

  @Get(':id/products')
  @Public()
  @ApiOperation({ summary: 'Get all products in a category', description: 'Returns all products under a category. For parent categories, includes products from all subcategories.' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'List of products' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findProducts(@Param('id', ParseUUIDPipe) id: string) {
    const products = await this.categoriesService.findProductsByCategory(id);
    return products.map((product: any) => this.formatProductResponse(product));
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image', categoryMulterOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create category', description: 'Admin endpoint to create a new category. Supports multipart/form-data with optional image upload.' })
  @ApiResponse({ status: 201, description: 'Category created' })
  @ApiResponse({ status: 409, description: 'Category slug already exists' })
  async create(
    @Body() dto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const category = await this.categoriesService.create(dto);
    if (file) {
      const updated = await this.uploadsService.saveCategoryImage(category.id, file);
      return this.formatCategoryResponse(updated);
    }
    return this.formatCategoryResponse(category);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image', categoryMulterOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update category', description: 'Admin endpoint to update a category. Supports multipart/form-data with optional image upload.' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category updated' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const category = await this.categoriesService.update(id, dto);
    if (file) {
      const updated = await this.uploadsService.saveCategoryImage(category.id, file);
      return this.formatCategoryResponse(updated);
    }
    return this.formatCategoryResponse(category);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete category', description: 'Admin endpoint to delete a category' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.categoriesService.delete(id);
    return { message: 'Category deleted successfully' };
  }

  // ==================== IMAGE ENDPOINTS ====================

  @Post(':id/image')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image', categoryMulterOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload category image', description: 'Admin endpoint to upload/replace the category image' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
      required: ['image'],
    },
  })
  @ApiResponse({ status: 201, description: 'Image uploaded' })
  @ApiResponse({ status: 400, description: 'Invalid file' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    const category = await this.uploadsService.saveCategoryImage(id, file);
    return this.formatCategoryResponse(category);
  }

  @Delete(':id/image')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete category image', description: 'Admin endpoint to remove the category image' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Image deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async deleteImage(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.uploadsService.deleteCategoryImage(id);
    return { message: 'Category image deleted successfully' };
  }

  // ==================== RESPONSE FORMATTERS ====================

  private formatCategoryResponse(category: any) {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentCategoryId: category.parentCategoryId,
      imageUrl: category.imageUrl,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      subcategories: category.subcategories
        ? category.subcategories.map((sub: any) => ({
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            description: sub.description,
            imageUrl: sub.imageUrl,
            sortOrder: sub.sortOrder,
            isActive: sub.isActive,
          }))
        : undefined,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  private formatProductResponse(product: any) {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price ? parseFloat(product.price) : 0,
      compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : undefined,
      requiresPrescription: product.requiresPrescription,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isBestSeller: product.isBestSeller,
      rating: product.rating ? parseFloat(product.rating) : 0,
      totalReviews: product.totalReviews,
      category: product.category
        ? { id: product.category.id, name: product.category.name, slug: product.category.slug }
        : undefined,
      images: product.images
        ? product.images.map((img: any) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            altText: img.altText,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          }))
        : undefined,
    };
  }

  private formatCategoryDetailResponse(category: any) {
    const isParent = category.parentCategoryId === null;

    const base = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentCategoryId: category.parentCategoryId,
      imageUrl: category.imageUrl,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    if (isParent) {
      return {
        ...base,
        subcategories: category.subcategories
          ? category.subcategories.map((sub: any) => ({
              id: sub.id,
              name: sub.name,
              slug: sub.slug,
              description: sub.description,
              imageUrl: sub.imageUrl,
              sortOrder: sub.sortOrder,
              isActive: sub.isActive,
              products: sub.products
                ? sub.products.map((product: any) => this.formatProductResponse(product))
                : [],
            }))
          : [],
      };
    }

    return {
      ...base,
      products: category.products
        ? category.products.map((product: any) => this.formatProductResponse(product))
        : [],
    };
  }
}
