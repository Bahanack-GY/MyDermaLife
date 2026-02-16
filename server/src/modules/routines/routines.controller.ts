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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto, RoutineProductItemDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { QueryRoutineDto } from './dto/query-routine.dto';
import {
  RoutineResponseDto,
  PaginatedRoutinesResponseDto,
} from './dto/routine-response.dto';
import { routineMulterOptions } from '../uploads/multer-config';
import * as fs from 'fs';
import * as path from 'path';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@ApiTags('Routines')
@Controller('routines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  // ==================== PUBLIC ENDPOINTS ====================

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all routines', description: 'Public endpoint to list routines with filters and pagination' })
  @ApiResponse({ status: 200, description: 'List of routines', type: PaginatedRoutinesResponseDto })
  async findAll(@Query() query: QueryRoutineDto): Promise<PaginatedRoutinesResponseDto> {
    const result = await this.routinesService.findAll(query);
    return {
      data: result.data.map((r) => this.formatRoutineResponse(r)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get(':idOrSlug')
  @Public()
  @ApiOperation({ summary: 'Get routine by ID or slug', description: 'Public endpoint to get a single routine with its products' })
  @ApiParam({ name: 'idOrSlug', description: 'Routine UUID or slug' })
  @ApiResponse({ status: 200, description: 'Routine detail', type: RoutineResponseDto })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  async findOne(@Param('idOrSlug') idOrSlug: string): Promise<RoutineResponseDto> {
    const routine = UUID_REGEX.test(idOrSlug)
      ? await this.routinesService.findById(idOrSlug)
      : await this.routinesService.findBySlug(idOrSlug);
    return this.formatRoutineResponse(routine);
  }

  // ==================== ADMIN ENDPOINTS ====================

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CATALOG_MANAGER)
  @UseInterceptors(FileInterceptor('image', routineMulterOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create routine', description: 'Admin endpoint to create a new routine with optional image' })
  @ApiResponse({ status: 201, description: 'Routine created', type: RoutineResponseDto })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  async create(
    @Body() dto: CreateRoutineDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: any,
  ): Promise<RoutineResponseDto> {
    const routine = await this.routinesService.create(dto, currentUser.id);

    if (file) {
      const imageUrl = `/uploads/routines/${file.filename}`;
      await routine.update({ imageUrl });
      return this.formatRoutineResponse(await this.routinesService.findById(routine.id));
    }

    return this.formatRoutineResponse(routine);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CATALOG_MANAGER)
  @UseInterceptors(FileInterceptor('image', routineMulterOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update routine', description: 'Admin endpoint to update a routine with optional image' })
  @ApiParam({ name: 'id', description: 'Routine UUID' })
  @ApiResponse({ status: 200, description: 'Routine updated', type: RoutineResponseDto })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoutineDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<RoutineResponseDto> {
    const routine = await this.routinesService.update(id, dto);

    if (file) {
      // Remove old image if exists
      if (routine.imageUrl) {
        this.removeFileFromDisk(routine.imageUrl);
      }
      const imageUrl = `/uploads/routines/${file.filename}`;
      await routine.update({ imageUrl });
      return this.formatRoutineResponse(await this.routinesService.findById(routine.id));
    }

    return this.formatRoutineResponse(routine);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CATALOG_MANAGER)
  @ApiOperation({ summary: 'Delete routine', description: 'Admin endpoint to soft-delete a routine' })
  @ApiParam({ name: 'id', description: 'Routine UUID' })
  @ApiResponse({ status: 200, description: 'Routine deleted' })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.routinesService.delete(id);
    return { message: 'Routine deleted successfully' };
  }

  // ==================== PRODUCT MANAGEMENT ====================

  @Put(':id/products')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CATALOG_MANAGER)
  @ApiOperation({ summary: 'Set routine products', description: 'Replace all products in a routine' })
  @ApiParam({ name: 'id', description: 'Routine UUID' })
  @ApiResponse({ status: 200, description: 'Products updated', type: RoutineResponseDto })
  async setProducts(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { items: RoutineProductItemDto[] },
  ): Promise<RoutineResponseDto> {
    const routine = await this.routinesService.setProducts(id, body.items);
    return this.formatRoutineResponse(routine);
  }

  @Post(':id/products')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CATALOG_MANAGER)
  @ApiOperation({ summary: 'Add product to routine', description: 'Add a single product to a routine' })
  @ApiParam({ name: 'id', description: 'Routine UUID' })
  @ApiResponse({ status: 201, description: 'Product added', type: RoutineResponseDto })
  @ApiResponse({ status: 409, description: 'Product already in routine' })
  async addProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() item: RoutineProductItemDto,
  ): Promise<RoutineResponseDto> {
    const routine = await this.routinesService.addProduct(id, item);
    return this.formatRoutineResponse(routine);
  }

  @Delete(':id/products/:productId')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CATALOG_MANAGER)
  @ApiOperation({ summary: 'Remove product from routine', description: 'Remove a product from a routine' })
  @ApiParam({ name: 'id', description: 'Routine UUID' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product removed', type: RoutineResponseDto })
  async removeProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<RoutineResponseDto> {
    const routine = await this.routinesService.removeProduct(id, productId);
    return this.formatRoutineResponse(routine);
  }

  // ==================== IMAGE ENDPOINTS ====================

  @Post(':id/image')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CATALOG_MANAGER)
  @UseInterceptors(FileInterceptor('image', routineMulterOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload routine image', description: 'Upload or replace the routine image' })
  @ApiParam({ name: 'id', description: 'Routine UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { image: { type: 'string', format: 'binary' } },
      required: ['image'],
    },
  })
  @ApiResponse({ status: 200, description: 'Image uploaded' })
  async uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ imageUrl: string }> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const routine = await this.routinesService.findById(id);

    if (routine.imageUrl) {
      this.removeFileFromDisk(routine.imageUrl);
    }

    const imageUrl = `/uploads/routines/${file.filename}`;
    await routine.update({ imageUrl });

    return { imageUrl };
  }

  @Delete(':id/image')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CATALOG_MANAGER)
  @ApiOperation({ summary: 'Delete routine image', description: 'Delete the routine image' })
  @ApiParam({ name: 'id', description: 'Routine UUID' })
  @ApiResponse({ status: 200, description: 'Image deleted' })
  async deleteImage(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    const routine = await this.routinesService.findById(id);

    if (!routine.imageUrl) {
      throw new BadRequestException('Routine has no image');
    }

    this.removeFileFromDisk(routine.imageUrl);
    await routine.update({ imageUrl: null });

    return { message: 'Routine image deleted successfully' };
  }

  // ==================== HELPERS ====================

  private formatRoutineResponse(routine: any): RoutineResponseDto {
    return {
      id: routine.id,
      name: routine.name,
      slug: routine.slug,
      description: routine.description,
      imageUrl: routine.imageUrl,
      isActive: routine.isActive,
      products: routine.products
        ? routine.products.map((rp: any) => ({
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
      createdAt: routine.createdAt,
      updatedAt: routine.updatedAt,
    };
  }

  private removeFileFromDisk(imageUrl: string): void {
    const filePath = path.join(process.cwd(), imageUrl);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // File may already be deleted, ignore
    }
  }
}
