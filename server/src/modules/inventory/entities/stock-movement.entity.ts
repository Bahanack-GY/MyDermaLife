import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Warehouse } from './warehouse.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

export enum MovementType {
  PURCHASE_ORDER_RECEIVED = 'purchase_order_received',
  SALE = 'sale',
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
}

export enum MovementDirection {
  IN = 'in',
  OUT = 'out',
}

export enum ReferenceType {
  PURCHASE_ORDER = 'purchase_order',
  ORDER = 'order',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
}

@Table({
  tableName: 'stock_movements',
  timestamps: false,
  underscored: true,
})
export class StockMovement extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Warehouse)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'warehouse_id',
  })
  declare warehouseId: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'product_id',
  })
  declare productId: string;

  @Column({
    type: DataType.ENUM(...Object.values(MovementType)),
    allowNull: false,
    field: 'movement_type',
  })
  declare movementType: MovementType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare quantity: number;

  @Column({
    type: DataType.ENUM(...Object.values(MovementDirection)),
    allowNull: false,
  })
  declare direction: MovementDirection;

  @Column({
    type: DataType.ENUM(...Object.values(ReferenceType)),
    allowNull: true,
    field: 'reference_type',
  })
  declare referenceType: ReferenceType;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'reference_id',
  })
  declare referenceId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare reason: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare notes: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'performed_by',
  })
  declare performedBy: string;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @BelongsTo(() => Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' })
  declare warehouse: Warehouse;

  @BelongsTo(() => Product, { foreignKey: 'productId', as: 'product' })
  declare product: Product;

  @BelongsTo(() => User, { foreignKey: 'performedBy', as: 'performer' })
  declare performer: User;
}
