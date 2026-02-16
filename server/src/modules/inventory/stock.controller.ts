import {
  Controller,
  Get,
  Post,
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
import { StockService } from './stock.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { QueryStockDto } from './dto/query-stock.dto';
import { QueryStockMovementsDto } from './dto/query-stock-movements.dto';

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('stock')
  @ApiOperation({ summary: 'Get stock levels across warehouses' })
  @ApiResponse({ status: 200, description: 'Stock levels retrieved successfully' })
  async getStockLevels(@Query() query: QueryStockDto) {
    return this.stockService.getStockLevels(query);
  }

  @Get('stock/:warehouseId/:productId')
  @ApiOperation({ summary: 'Get stock for a specific product in a warehouse' })
  @ApiResponse({ status: 200, description: 'Stock record retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Stock record not found' })
  async getProductStock(
    @Param('warehouseId', ParseUUIDPipe) warehouseId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.stockService.getProductStock(warehouseId, productId);
  }

  @Post('stock/adjust')
  @ApiOperation({ summary: 'Manually adjust stock (reason required)' })
  @ApiResponse({ status: 201, description: 'Stock adjusted successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient stock or invalid adjustment' })
  async adjustStock(
    @Body() dto: AdjustStockDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.stockService.adjustStock(dto, currentUser.id);
  }

  @Post('stock/transfer')
  @ApiOperation({ summary: 'Transfer stock between warehouses' })
  @ApiResponse({ status: 201, description: 'Stock transferred successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient stock or invalid transfer' })
  async transferStock(
    @Body() dto: TransferStockDto,
    @CurrentUser() currentUser: any,
  ) {
    return this.stockService.transferStock(dto, currentUser.id);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Get stock movement history' })
  @ApiResponse({ status: 200, description: 'Movements retrieved successfully' })
  async getMovements(@Query() query: QueryStockMovementsDto) {
    return this.stockService.getMovements(query);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get low stock and out of stock alerts' })
  @ApiResponse({ status: 200, description: 'Alerts retrieved successfully' })
  async getAlerts() {
    return this.stockService.getAlerts();
  }
}
