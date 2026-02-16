import {
  Controller,
  Get,
  Post,
  Put,
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
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';
import { PurchaseOrderStatus } from './entities/purchase-order.entity';

@ApiTags('Purchase Orders')
@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class PurchaseOrdersController {
  constructor(
    private readonly purchaseOrdersService: PurchaseOrdersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all purchase orders' })
  @ApiResponse({ status: 200, description: 'Purchase orders retrieved successfully' })
  async findAll(
    @Query('supplierId') supplierId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('status') status?: PurchaseOrderStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.purchaseOrdersService.findAll({
      supplierId,
      warehouseId,
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order details with items' })
  @ApiResponse({ status: 200, description: 'Purchase order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseOrdersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new purchase order (draft)' })
  @ApiResponse({ status: 201, description: 'Purchase order created successfully' })
  async create(
    @Body() dto: CreatePurchaseOrderDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.purchaseOrdersService.create(dto, currentUser.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a purchase order (draft/submitted only)' })
  @ApiResponse({ status: 200, description: 'Purchase order updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update in current status' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePurchaseOrderDto,
  ) {
    return this.purchaseOrdersService.update(id, dto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit a purchase order (draft -> submitted)' })
  @ApiResponse({ status: 200, description: 'Purchase order submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async submit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.purchaseOrdersService.submit(id, currentUser.id);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm a purchase order (submitted -> confirmed)' })
  @ApiResponse({ status: 200, description: 'Purchase order confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.purchaseOrdersService.confirm(id, currentUser.id);
  }

  @Post(':id/receive')
  @ApiOperation({ summary: 'Receive purchase order items (partial or full)' })
  @ApiResponse({ status: 200, description: 'Items received successfully' })
  @ApiResponse({ status: 400, description: 'Invalid receive quantities or status' })
  async receive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReceivePurchaseOrderDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.purchaseOrdersService.receive(id, dto, currentUser.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel in current status' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: any,
  ) {
    return this.purchaseOrdersService.cancel(id, currentUser.id);
  }
}
