import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Table({
  tableName: 'order_items',
  timestamps: false,
  underscored: true,
})
export class OrderItem extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Order)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'order_id',
  })
  declare orderId: string;

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
  })
  declare quantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_price',
  })
  declare unitPrice: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'discount_amount',
  })
  declare discountAmount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_price',
  })
  declare totalPrice: number;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @BelongsTo(() => Order, { foreignKey: 'orderId', as: 'order' })
  declare order: Order;

  @BelongsTo(() => Product, { foreignKey: 'productId', as: 'product' })
  declare product: Product;
}
