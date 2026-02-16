import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Supplier } from './supplier.entity';
import { Warehouse } from '../../inventory/entities/warehouse.entity';
import { User } from '../../users/entities/user.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  CONFIRMED = 'confirmed',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

@Table({
  tableName: 'purchase_orders',
  timestamps: true,
  underscored: true,
})
export class PurchaseOrder extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
    field: 'po_number',
  })
  declare poNumber: string;

  @ForeignKey(() => Supplier)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'supplier_id',
  })
  declare supplierId: string;

  @ForeignKey(() => Warehouse)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'warehouse_id',
  })
  declare warehouseId: string;

  @Column({
    type: DataType.ENUM(...Object.values(PurchaseOrderStatus)),
    defaultValue: PurchaseOrderStatus.DRAFT,
  })
  declare status: PurchaseOrderStatus;

  @Column({
    type: DataType.DATEONLY,
    defaultValue: DataType.NOW,
    field: 'order_date',
  })
  declare orderDate: Date;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
    field: 'expected_delivery_date',
  })
  declare expectedDeliveryDate: Date;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
    field: 'received_date',
  })
  declare receivedDate: Date;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
  })
  declare subtotal: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'tax_amount',
  })
  declare taxAmount: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'shipping_cost',
  })
  declare shippingCost: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
    field: 'total_amount',
  })
  declare totalAmount: number;

  @Column({
    type: DataType.STRING(10),
    defaultValue: 'XAF',
  })
  declare currency: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare notes: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'created_by',
  })
  declare createdBy: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'approved_by',
  })
  declare approvedBy: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'received_by',
  })
  declare receivedBy: string;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @BelongsTo(() => Supplier, { foreignKey: 'supplierId', as: 'supplier' })
  declare supplier: Supplier;

  @BelongsTo(() => Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' })
  declare warehouse: Warehouse;

  @BelongsTo(() => User, { foreignKey: 'createdBy', as: 'creator' })
  declare creator: User;

  @HasMany(() => PurchaseOrderItem, { foreignKey: 'purchaseOrderId', as: 'items' })
  declare items: PurchaseOrderItem[];
}
