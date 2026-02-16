import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { PurchaseOrder } from './purchase-order.entity';
import { Product } from '../../products/entities/product.entity';

@Table({
  tableName: 'purchase_order_items',
  timestamps: true,
  underscored: true,
})
export class PurchaseOrderItem extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => PurchaseOrder)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'purchase_order_id',
  })
  declare purchaseOrderId: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'product_id',
  })
  declare productId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'quantity_ordered',
  })
  declare quantityOrdered: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    field: 'quantity_received',
  })
  declare quantityReceived: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_cost',
  })
  declare unitCost: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    field: 'total_cost',
  })
  declare totalCost: number;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @BelongsTo(() => PurchaseOrder, { foreignKey: 'purchaseOrderId', as: 'purchaseOrder' })
  declare purchaseOrder: PurchaseOrder;

  @BelongsTo(() => Product, { foreignKey: 'productId', as: 'product' })
  declare product: Product;
}
