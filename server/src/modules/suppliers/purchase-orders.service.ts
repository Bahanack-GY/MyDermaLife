import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { Supplier } from './entities/supplier.entity';
import { Warehouse } from '../inventory/entities/warehouse.entity';
import { Product } from '../products/entities/product.entity';
import { StockService } from '../inventory/stock.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ReceivePurchaseOrderDto } from './dto/receive-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectModel(PurchaseOrder)
    private purchaseOrderModel: typeof PurchaseOrder,
    @InjectModel(PurchaseOrderItem)
    private purchaseOrderItemModel: typeof PurchaseOrderItem,
    @InjectModel(Supplier)
    private supplierModel: typeof Supplier,
    @InjectModel(Warehouse)
    private warehouseModel: typeof Warehouse,
    @InjectModel(Product)
    private productModel: typeof Product,
    private stockService: StockService,
    private sequelize: Sequelize,
  ) {}

  private get defaultInclude() {
    return [
      { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'code'] },
      { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'code', 'country'] },
      {
        model: PurchaseOrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'sku', 'name'] }],
      },
    ];
  }

  async findAll(query: {
    supplierId?: string;
    warehouseId?: string;
    status?: PurchaseOrderStatus;
    page?: number;
    limit?: number;
  }) {
    const { supplierId, warehouseId, status, page = 1, limit = 10 } = query;
    const where: any = {};

    if (supplierId) where.supplierId = supplierId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (status) where.status = status;

    const { rows: data, count: total } =
      await this.purchaseOrderModel.findAndCountAll({
        where,
        include: [
          { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'code'] },
          { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'code'] },
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

  async findById(id: string) {
    const po = await this.purchaseOrderModel.findByPk(id, {
      include: this.defaultInclude,
    });
    if (!po) {
      throw new NotFoundException('Purchase order not found');
    }
    return po;
  }

  async create(dto: CreatePurchaseOrderDto, userId: string) {
    return this.sequelize.transaction(async (transaction) => {
      // Validate supplier and warehouse
      const supplier = await this.supplierModel.findByPk(dto.supplierId, { transaction });
      if (!supplier) throw new NotFoundException('Supplier not found');

      const warehouse = await this.warehouseModel.findByPk(dto.warehouseId, { transaction });
      if (!warehouse) throw new NotFoundException('Warehouse not found');

      // Validate products
      for (const item of dto.items) {
        const product = await this.productModel.findByPk(item.productId, { transaction });
        if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      }

      // Calculate totals
      const subtotal = dto.items.reduce(
        (sum, item) => sum + item.quantityOrdered * item.unitCost,
        0,
      );
      const taxAmount = dto.taxAmount || 0;
      const shippingCost = dto.shippingCost || 0;
      const totalAmount = subtotal + taxAmount + shippingCost;

      // Create PO
      const po = await this.purchaseOrderModel.create(
        {
          supplierId: dto.supplierId,
          warehouseId: dto.warehouseId,
          status: PurchaseOrderStatus.DRAFT,
          expectedDeliveryDate: dto.expectedDeliveryDate,
          subtotal,
          taxAmount,
          shippingCost,
          totalAmount,
          currency: dto.currency || 'XAF',
          notes: dto.notes,
          createdBy: userId,
        } as any,
        { transaction },
      );

      // Create PO items
      const itemsData = dto.items.map((item) => ({
        purchaseOrderId: po.id,
        productId: item.productId,
        quantityOrdered: item.quantityOrdered,
        quantityReceived: 0,
        unitCost: item.unitCost,
        totalCost: item.quantityOrdered * item.unitCost,
      }));

      await this.purchaseOrderItemModel.bulkCreate(itemsData as any[], { transaction });

      return this.findById(po.id);
    });
  }

  async update(id: string, dto: UpdatePurchaseOrderDto) {
    const po = await this.purchaseOrderModel.findByPk(id);
    if (!po) throw new NotFoundException('Purchase order not found');

    if (
      po.status !== PurchaseOrderStatus.DRAFT &&
      po.status !== PurchaseOrderStatus.SUBMITTED
    ) {
      throw new BadRequestException(
        `Cannot update purchase order in '${po.status}' status`,
      );
    }

    const updateData: any = { ...dto };

    // Recalculate total if tax or shipping changed
    if (dto.taxAmount !== undefined || dto.shippingCost !== undefined) {
      const taxAmount = dto.taxAmount ?? Number(po.taxAmount);
      const shippingCost = dto.shippingCost ?? Number(po.shippingCost);
      updateData.totalAmount = Number(po.subtotal) + taxAmount + shippingCost;
    }

    await po.update(updateData);
    return this.findById(id);
  }

  async submit(id: string, userId: string) {
    const po = await this.purchaseOrderModel.findByPk(id);
    if (!po) throw new NotFoundException('Purchase order not found');

    if (po.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot submit purchase order in '${po.status}' status. Must be 'draft'.`,
      );
    }

    await po.update({ status: PurchaseOrderStatus.SUBMITTED });
    return this.findById(id);
  }

  async confirm(id: string, userId: string) {
    const po = await this.purchaseOrderModel.findByPk(id);
    if (!po) throw new NotFoundException('Purchase order not found');

    if (po.status !== PurchaseOrderStatus.SUBMITTED) {
      throw new BadRequestException(
        `Cannot confirm purchase order in '${po.status}' status. Must be 'submitted'.`,
      );
    }

    await po.update({
      status: PurchaseOrderStatus.CONFIRMED,
      approvedBy: userId,
    });
    return this.findById(id);
  }

  async receive(id: string, dto: ReceivePurchaseOrderDto, userId: string) {
    return this.sequelize.transaction(async (transaction) => {
      const po = await this.purchaseOrderModel.findByPk(id, {
        include: [{ model: PurchaseOrderItem, as: 'items' }],
        transaction,
        lock: true,
      });
      if (!po) throw new NotFoundException('Purchase order not found');

      if (
        po.status !== PurchaseOrderStatus.CONFIRMED &&
        po.status !== PurchaseOrderStatus.PARTIALLY_RECEIVED
      ) {
        throw new BadRequestException(
          `Cannot receive purchase order in '${po.status}' status. Must be 'confirmed' or 'partially_received'.`,
        );
      }

      // Process each received item
      for (const receiveItem of dto.items) {
        const poItem = po.items.find(
          (item) => item.id === receiveItem.purchaseOrderItemId,
        );
        if (!poItem) {
          throw new NotFoundException(
            `Purchase order item ${receiveItem.purchaseOrderItemId} not found`,
          );
        }

        const totalReceived = poItem.quantityReceived + receiveItem.quantityReceived;
        if (totalReceived > poItem.quantityOrdered) {
          throw new BadRequestException(
            `Cannot receive more than ordered. Ordered: ${poItem.quantityOrdered}, already received: ${poItem.quantityReceived}, attempting: ${receiveItem.quantityReceived}`,
          );
        }

        // Update PO item quantity received
        await poItem.update(
          { quantityReceived: totalReceived },
          { transaction },
        );

        // Add stock to warehouse
        if (receiveItem.quantityReceived > 0) {
          await this.stockService.receiveStock(
            po.warehouseId,
            poItem.productId,
            receiveItem.quantityReceived,
            po.id,
            userId,
            transaction,
          );
        }
      }

      // Reload items to check if fully received
      const updatedItems = await this.purchaseOrderItemModel.findAll({
        where: { purchaseOrderId: id },
        transaction,
      });

      const allReceived = updatedItems.every(
        (item) => item.quantityReceived >= item.quantityOrdered,
      );
      const anyReceived = updatedItems.some(
        (item) => item.quantityReceived > 0,
      );

      let newStatus: PurchaseOrderStatus;
      if (allReceived) {
        newStatus = PurchaseOrderStatus.RECEIVED;
      } else if (anyReceived) {
        newStatus = PurchaseOrderStatus.PARTIALLY_RECEIVED;
      } else {
        newStatus = po.status;
      }

      await po.update(
        {
          status: newStatus,
          receivedBy: userId,
          ...(allReceived ? { receivedDate: new Date() } : {}),
        },
        { transaction },
      );

      return this.findById(id);
    });
  }

  async cancel(id: string, userId: string) {
    const po = await this.purchaseOrderModel.findByPk(id);
    if (!po) throw new NotFoundException('Purchase order not found');

    const cancellableStatuses = [
      PurchaseOrderStatus.DRAFT,
      PurchaseOrderStatus.SUBMITTED,
      PurchaseOrderStatus.CONFIRMED,
    ];

    if (!cancellableStatuses.includes(po.status)) {
      throw new BadRequestException(
        `Cannot cancel purchase order in '${po.status}' status`,
      );
    }

    await po.update({ status: PurchaseOrderStatus.CANCELLED });
    return this.findById(id);
  }
}
