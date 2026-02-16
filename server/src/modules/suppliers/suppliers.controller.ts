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
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { QuerySupplierDto } from './dto/query-supplier.dto';
import { CreateSupplierProductDto } from './dto/create-supplier-product.dto';
import { UpdateSupplierProductDto } from './dto/update-supplier-product.dto';

@ApiTags('Suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: 'List all suppliers' })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully' })
  async findAll(@Query() query: QuerySupplierDto) {
    return this.suppliersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier details with products' })
  @ApiResponse({ status: 200, description: 'Supplier retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully' })
  @ApiResponse({ status: 409, description: 'Supplier code already exists' })
  async create(
    @Body() dto: CreateSupplierDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.suppliersService.create(dto, currentUser.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a supplier' })
  @ApiResponse({ status: 200, description: 'Supplier deleted successfully' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.delete(id);
  }

  // ==================== SUPPLIER-PRODUCT LINKS ====================

  @Get(':id/products')
  @ApiOperation({ summary: 'Get products from a supplier' })
  @ApiResponse({ status: 200, description: 'Supplier products retrieved successfully' })
  async getSupplierProducts(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.getSupplierProducts(id);
  }

  @Post(':id/products')
  @ApiOperation({ summary: 'Link a product to a supplier' })
  @ApiResponse({ status: 201, description: 'Product linked successfully' })
  @ApiResponse({ status: 409, description: 'Product already linked' })
  async linkProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSupplierProductDto,
  ) {
    return this.suppliersService.linkProduct(id, dto);
  }

  @Put(':id/products/:productId')
  @ApiOperation({ summary: 'Update a supplier-product link' })
  @ApiResponse({ status: 200, description: 'Link updated successfully' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  async updateProductLink(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateSupplierProductDto,
  ) {
    return this.suppliersService.updateProductLink(id, productId, dto);
  }

  @Delete(':id/products/:productId')
  @ApiOperation({ summary: 'Remove a supplier-product link' })
  @ApiResponse({ status: 200, description: 'Link removed successfully' })
  @ApiResponse({ status: 404, description: 'Link not found' })
  async removeProductLink(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.suppliersService.removeProductLink(id, productId);
  }
}
