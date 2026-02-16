import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseStock } from './entities/warehouse-stock.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { Product } from '../products/entities/product.entity';
import { WarehouseController } from './warehouse.controller';
import { StockController } from './stock.controller';
import { WarehouseService } from './warehouse.service';
import { StockService } from './stock.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Warehouse, WarehouseStock, StockMovement, Product]),
  ],
  controllers: [WarehouseController, StockController],
  providers: [WarehouseService, StockService],
  exports: [WarehouseService, StockService, SequelizeModule],
})
export class InventoryModule {}
