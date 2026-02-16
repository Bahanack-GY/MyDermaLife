import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Supplier } from './entities/supplier.entity';
import { SupplierProduct } from './entities/supplier-product.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { Product } from '../products/entities/product.entity';
import { Warehouse } from '../inventory/entities/warehouse.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { SuppliersController } from './suppliers.controller';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { SuppliersService } from './suppliers.service';
import { PurchaseOrdersService } from './purchase-orders.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Supplier,
      SupplierProduct,
      PurchaseOrder,
      PurchaseOrderItem,
      Product,
      Warehouse,
    ]),
    InventoryModule,
  ],
  controllers: [SuppliersController, PurchaseOrdersController],
  providers: [SuppliersService, PurchaseOrdersService],
  exports: [SuppliersService, PurchaseOrdersService, SequelizeModule],
})
export class SuppliersModule {}
