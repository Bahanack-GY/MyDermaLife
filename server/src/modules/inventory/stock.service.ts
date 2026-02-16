import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op, fn, col } from 'sequelize';
import { WarehouseStock } from './entities/warehouse-stock.entity';
import { StockMovement, MovementType, MovementDirection, ReferenceType } from './entities/stock-movement.entity';
import { Warehouse } from './entities/warehouse.entity';
import { Product } from '../products/entities/product.entity';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { TransferStockDto } from './dto/transfer-stock.dto';
import { QueryStockDto } from './dto/query-stock.dto';
import { QueryStockMovementsDto } from './dto/query-stock-movements.dto';

@Injectable()
export class StockService {
  constructor(
    @InjectModel(WarehouseStock)
    private warehouseStockModel: typeof WarehouseStock,
    @InjectModel(StockMovement)
    private stockMovementModel: typeof StockMovement,
    @InjectModel(Warehouse)
    private warehouseModel: typeof Warehouse,
    @InjectModel(Product)
    private productModel: typeof Product,
    private sequelize: Sequelize,
  ) {}

  async getStockLevels(query: QueryStockDto) {
    const { warehouseId, productId, lowStock, outOfStock, page = 1, limit = 10 } = query;
    const where: any = {};

    if (warehouseId) where.warehouseId = warehouseId;
    if (productId) where.productId = productId;
    if (outOfStock) {
      where.quantity = 0;
    } else if (lowStock) {
      where.quantity = {
        [Op.gt]: 0,
        [Op.lte]: col('low_stock_threshold'),
      };
    }

    const { rows: data, count: total } =
      await this.warehouseStockModel.findAndCountAll({
        where,
        include: [
          { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'code', 'country', 'city'] },
          { model: Product, as: 'product', attributes: ['id', 'sku', 'name', 'slug'] },
        ],
        limit,
        offset: (page - 1) * limit,
        order: [['updatedAt', 'DESC']],
      });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductStock(warehouseId: string, productId: string) {
    const stock = await this.warehouseStockModel.findOne({
      where: { warehouseId, productId },
      include: [
        { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'code', 'country', 'city'] },
        { model: Product, as: 'product', attributes: ['id', 'sku', 'name', 'slug'] },
      ],
    });

    if (!stock) {
      throw new NotFoundException('Stock record not found for this warehouse/product combination');
    }

    return stock;
  }

  async adjustStock(dto: AdjustStockDto, userId: string) {
    const { warehouseId, productId, quantity, reason, notes } = dto;

    return this.sequelize.transaction(async (transaction) => {
      // Validate warehouse and product exist
      const warehouse = await this.warehouseModel.findByPk(warehouseId, { transaction });
      if (!warehouse) throw new NotFoundException('Warehouse not found');

      const product = await this.productModel.findByPk(productId, { transaction });
      if (!product) throw new NotFoundException('Product not found');

      // Find or create stock record
      let stock = await this.warehouseStockModel.findOne({
        where: { warehouseId, productId },
        transaction,
        lock: true,
      });

      if (!stock) {
        if (quantity < 0) {
          throw new BadRequestException('Cannot adjust stock below zero for a new stock record');
        }
        stock = await this.warehouseStockModel.create(
          { warehouseId, productId, quantity: 0 } as any,
          { transaction },
        );
      }

      const newQuantity = stock.quantity + quantity;
      if (newQuantity < 0) {
        throw new BadRequestException(
          `Insufficient stock. Current: ${stock.quantity}, adjustment: ${quantity}`,
        );
      }

      await stock.update(
        {
          quantity: newQuantity,
          ...(quantity > 0 ? { lastRestockedAt: new Date() } : {}),
        },
        { transaction },
      );

      // Create movement record
      const direction = quantity > 0 ? MovementDirection.IN : MovementDirection.OUT;
      await this.stockMovementModel.create(
        {
          warehouseId,
          productId,
          movementType: MovementType.ADJUSTMENT,
          quantity: Math.abs(quantity),
          direction,
          referenceType: ReferenceType.ADJUSTMENT,
          reason,
          notes,
          performedBy: userId,
        } as any,
        { transaction },
      );

      // Update product stock_quantity for backward compatibility
      await this.updateProductTotalStock(productId, transaction);

      return stock.reload({ transaction });
    });
  }

  async transferStock(dto: TransferStockDto, userId: string) {
    const { sourceWarehouseId, destinationWarehouseId, productId, quantity, reason, notes } = dto;

    if (sourceWarehouseId === destinationWarehouseId) {
      throw new BadRequestException('Source and destination warehouses must be different');
    }

    return this.sequelize.transaction(async (transaction) => {
      // Validate warehouses and product
      const sourceWarehouse = await this.warehouseModel.findByPk(sourceWarehouseId, { transaction });
      if (!sourceWarehouse) throw new NotFoundException('Source warehouse not found');

      const destWarehouse = await this.warehouseModel.findByPk(destinationWarehouseId, { transaction });
      if (!destWarehouse) throw new NotFoundException('Destination warehouse not found');

      const product = await this.productModel.findByPk(productId, { transaction });
      if (!product) throw new NotFoundException('Product not found');

      // Deduct from source
      const sourceStock = await this.warehouseStockModel.findOne({
        where: { warehouseId: sourceWarehouseId, productId },
        transaction,
        lock: true,
      });

      if (!sourceStock || sourceStock.quantity < quantity) {
        throw new BadRequestException(
          `Insufficient stock in source warehouse. Available: ${sourceStock?.quantity || 0}, requested: ${quantity}`,
        );
      }

      await sourceStock.update(
        { quantity: sourceStock.quantity - quantity },
        { transaction },
      );

      // Add to destination
      let destStock = await this.warehouseStockModel.findOne({
        where: { warehouseId: destinationWarehouseId, productId },
        transaction,
        lock: true,
      });

      if (!destStock) {
        destStock = await this.warehouseStockModel.create(
          { warehouseId: destinationWarehouseId, productId, quantity: 0 } as any,
          { transaction },
        );
      }

      await destStock.update(
        {
          quantity: destStock.quantity + quantity,
          lastRestockedAt: new Date(),
        },
        { transaction },
      );

      // Create transfer_out movement
      const transferId = require('crypto').randomUUID();
      await this.stockMovementModel.create(
        {
          warehouseId: sourceWarehouseId,
          productId,
          movementType: MovementType.TRANSFER_OUT,
          quantity,
          direction: MovementDirection.OUT,
          referenceType: ReferenceType.TRANSFER,
          referenceId: transferId,
          reason,
          notes,
          performedBy: userId,
        } as any,
        { transaction },
      );

      // Create transfer_in movement
      await this.stockMovementModel.create(
        {
          warehouseId: destinationWarehouseId,
          productId,
          movementType: MovementType.TRANSFER_IN,
          quantity,
          direction: MovementDirection.IN,
          referenceType: ReferenceType.TRANSFER,
          referenceId: transferId,
          reason,
          notes,
          performedBy: userId,
        } as any,
        { transaction },
      );

      return {
        message: 'Stock transferred successfully',
        transferId,
        source: { warehouseId: sourceWarehouseId, newQuantity: sourceStock.quantity - quantity },
        destination: { warehouseId: destinationWarehouseId, newQuantity: destStock.quantity + quantity },
      };
    });
  }

  async getMovements(query: QueryStockMovementsDto) {
    const { warehouseId, productId, movementType, referenceType, startDate, endDate, page = 1, limit = 10 } = query;
    const where: any = {};

    if (warehouseId) where.warehouseId = warehouseId;
    if (productId) where.productId = productId;
    if (movementType) where.movementType = movementType;
    if (referenceType) where.referenceType = referenceType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { rows: data, count: total } =
      await this.stockMovementModel.findAndCountAll({
        where,
        include: [
          { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'code'] },
          { model: Product, as: 'product', attributes: ['id', 'sku', 'name'] },
        ],
        limit,
        offset: (page - 1) * limit,
        order: [['createdAt', 'DESC']],
      });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAlerts() {
    const lowStock = await this.warehouseStockModel.findAll({
      where: {
        quantity: {
          [Op.gt]: 0,
          [Op.lte]: col('low_stock_threshold'),
        },
      },
      include: [
        { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'code', 'country'] },
        { model: Product, as: 'product', attributes: ['id', 'sku', 'name'] },
      ],
      order: [['quantity', 'ASC']],
    });

    const outOfStock = await this.warehouseStockModel.findAll({
      where: { quantity: 0 },
      include: [
        { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'code', 'country'] },
        { model: Product, as: 'product', attributes: ['id', 'sku', 'name'] },
      ],
    });

    return { lowStock, outOfStock };
  }

  async receiveStock(
    warehouseId: string,
    productId: string,
    quantity: number,
    poId: string,
    userId: string,
    transaction?: any,
  ) {
    let stock = await this.warehouseStockModel.findOne({
      where: { warehouseId, productId },
      transaction,
      lock: transaction ? true : undefined,
    });

    if (!stock) {
      stock = await this.warehouseStockModel.create(
        { warehouseId, productId, quantity: 0 } as any,
        { transaction },
      );
    }

    await stock.update(
      {
        quantity: stock.quantity + quantity,
        lastRestockedAt: new Date(),
      },
      { transaction },
    );

    await this.stockMovementModel.create(
      {
        warehouseId,
        productId,
        movementType: MovementType.PURCHASE_ORDER_RECEIVED,
        quantity,
        direction: MovementDirection.IN,
        referenceType: ReferenceType.PURCHASE_ORDER,
        referenceId: poId,
        reason: 'Purchase order received',
        performedBy: userId,
      } as any,
      { transaction },
    );

    await this.updateProductTotalStock(productId, transaction);

    return stock.reload({ transaction });
  }

  async deductForSale(
    warehouseId: string,
    productId: string,
    quantity: number,
    orderId: string,
    userId: string,
    transaction?: any,
  ) {
    const stock = await this.warehouseStockModel.findOne({
      where: { warehouseId, productId },
      transaction,
      lock: transaction ? true : undefined,
    });

    if (!stock || stock.quantity < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${stock?.quantity || 0}, requested: ${quantity}`,
      );
    }

    await stock.update({ quantity: stock.quantity - quantity }, { transaction });

    await this.stockMovementModel.create(
      {
        warehouseId,
        productId,
        movementType: MovementType.SALE,
        quantity,
        direction: MovementDirection.OUT,
        referenceType: ReferenceType.ORDER,
        referenceId: orderId,
        reason: 'Order sale',
        performedBy: userId,
      } as any,
      { transaction },
    );

    await this.updateProductTotalStock(productId, transaction);

    return stock.reload({ transaction });
  }

  async restoreForCancellation(
    warehouseId: string,
    productId: string,
    quantity: number,
    orderId: string,
    userId: string,
    transaction?: any,
  ) {
    let stock = await this.warehouseStockModel.findOne({
      where: { warehouseId, productId },
      transaction,
      lock: transaction ? true : undefined,
    });

    if (!stock) {
      stock = await this.warehouseStockModel.create(
        { warehouseId, productId, quantity: 0 } as any,
        { transaction },
      );
    }

    await stock.update({ quantity: stock.quantity + quantity }, { transaction });

    await this.stockMovementModel.create(
      {
        warehouseId,
        productId,
        movementType: MovementType.RETURN,
        quantity,
        direction: MovementDirection.IN,
        referenceType: ReferenceType.RETURN,
        referenceId: orderId,
        reason: 'Order cancellation - stock restored',
        performedBy: userId,
      } as any,
      { transaction },
    );

    await this.updateProductTotalStock(productId, transaction);

    return stock.reload({ transaction });
  }

  private async updateProductTotalStock(productId: string, transaction?: any) {
    const result = await this.warehouseStockModel.findAll({
      where: { productId },
      attributes: [
        [fn('SUM', col('quantity')), 'totalStock'],
      ],
      transaction,
      raw: true,
    });

    const totalStock = Number(result[0]?.['totalStock'] || 0);
    await this.productModel.update(
      { stockQuantity: totalStock },
      { where: { id: productId }, transaction },
    );
  }
}
