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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { DeliveriesService } from './deliveries.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { QueryShipmentDto } from './dto/query-shipment.dto';

@ApiTags('Deliveries')
@Controller('deliveries')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  // --- Admin endpoints ---

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create shipment for an order (admin)' })
  @ApiResponse({ status: 201, description: 'Shipment created' })
  async create(@Body() dto: CreateShipmentDto) {
    return this.deliveriesService.create(dto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'List all shipments (admin)' })
  @ApiResponse({ status: 200, description: 'Paginated list of shipments' })
  async findAll(@Query() query: QueryShipmentDto) {
    return this.deliveriesService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delivery dashboard stats (admin)' })
  @ApiResponse({ status: 200, description: 'Stats by status and today count' })
  async getStats() {
    return this.deliveriesService.getStats();
  }

  @Get('my-assignments')
  @Roles(UserRole.DELIVERY, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'List my assigned shipments (delivery staff)' })
  @ApiResponse({ status: 200, description: 'Paginated list of assigned shipments' })
  async getMyAssignments(
    @CurrentUser('id') driverId: string,
    @Query() query: QueryShipmentDto,
  ) {
    return this.deliveriesService.findMyAssignments(driverId, query);
  }

  @Get('my-stats')
  @Roles(UserRole.DELIVERY, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'My delivery performance stats (delivery staff)' })
  @ApiResponse({ status: 200, description: 'Driver performance metrics' })
  async getMyStats(@CurrentUser('id') driverId: string) {
    return this.deliveriesService.getDriverStats(driverId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DELIVERY)
  @ApiOperation({ summary: 'Get shipment detail' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiResponse({ status: 200, description: 'Shipment details' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.deliveriesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update shipment (admin)' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiResponse({ status: 200, description: 'Shipment updated' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShipmentDto,
  ) {
    return this.deliveriesService.update(id, dto);
  }

  @Put(':id/assign')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign driver to shipment (admin)' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiResponse({ status: 200, description: 'Driver assigned' })
  async assignDriver(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('assignedDriver', ParseUUIDPipe) driverId: string,
  ) {
    return this.deliveriesService.assignDriver(id, driverId);
  }

  @Put(':id/status')
  @Roles(UserRole.DELIVERY, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update delivery status (delivery staff)' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return this.deliveriesService.updateStatus(id, status);
  }

  @Put(':id/proof')
  @Roles(UserRole.DELIVERY, UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Add proof of delivery (delivery staff)' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiResponse({ status: 200, description: 'Proof added' })
  async addProofOfDelivery(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('proofOfDeliveryUrl') url: string,
    @Body('deliveryNotes') notes?: string,
  ) {
    return this.deliveriesService.addProofOfDelivery(id, url, notes);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete shipment (admin)' })
  @ApiParam({ name: 'id', description: 'Shipment UUID' })
  @ApiResponse({ status: 200, description: 'Shipment deleted' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.deliveriesService.delete(id);
    return { message: 'Shipment deleted successfully' };
  }
}
