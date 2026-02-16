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
import { Sequelize } from 'sequelize';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

@Table({
  tableName: 'orders',
  timestamps: true,
  underscored: true,
})
export class Order extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(50),
    unique: true,
    allowNull: false,
    defaultValue: Sequelize.literal("generate_order_number()"),
    field: 'order_number',
  })
  declare orderNumber: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'user_id',
  })
  declare userId: string;

  @Column({ type: DataType.STRING(255), allowNull: true, field: 'guest_email' })
  declare guestEmail: string;

  @Column({ type: DataType.STRING(100), allowNull: true, field: 'guest_first_name' })
  declare guestFirstName: string;

  @Column({ type: DataType.STRING(100), allowNull: true, field: 'guest_last_name' })
  declare guestLastName: string;

  @Column({ type: DataType.STRING(50), allowNull: true, field: 'guest_phone' })
  declare guestPhone: string;

  @Column({ type: DataType.STRING(50), defaultValue: 'pending' })
  declare status: string;

  @Column({ type: DataType.STRING(50), defaultValue: 'pending', field: 'payment_status' })
  declare paymentStatus: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare subtotal: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0, field: 'discount_amount' })
  declare discountAmount: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0, field: 'shipping_cost' })
  declare shippingCost: number;

  @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0, field: 'tax_amount' })
  declare taxAmount: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false, field: 'total_amount' })
  declare totalAmount: number;

  @Column({ type: DataType.STRING(10), defaultValue: 'XAF' })
  declare currency: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare notes: string;

  @Column({ type: DataType.STRING(100), allowNull: true, field: 'shipping_first_name' })
  declare shippingFirstName: string;

  @Column({ type: DataType.STRING(100), allowNull: true, field: 'shipping_last_name' })
  declare shippingLastName: string;

  @Column({ type: DataType.STRING(50), allowNull: true, field: 'shipping_phone' })
  declare shippingPhone: string;

  @Column({ type: DataType.STRING(255), allowNull: true, field: 'shipping_address_line1' })
  declare shippingAddressLine1: string;

  @Column({ type: DataType.STRING(255), allowNull: true, field: 'shipping_address_line2' })
  declare shippingAddressLine2: string;

  @Column({ type: DataType.STRING(100), allowNull: true, field: 'shipping_city' })
  declare shippingCity: string;

  @Column({ type: DataType.STRING(100), allowNull: true, field: 'shipping_state' })
  declare shippingState: string;

  @Column({ type: DataType.STRING(100), allowNull: true, field: 'shipping_country' })
  declare shippingCountry: string;

  @Column({ type: DataType.DATE, allowNull: true, field: 'shipped_at' })
  declare shippedAt: Date;

  @Column({ type: DataType.DATE, allowNull: true, field: 'delivered_at' })
  declare deliveredAt: Date;

  @Column({ type: DataType.DATE, allowNull: true, field: 'cancelled_at' })
  declare cancelledAt: Date;

  @Column({ type: DataType.TEXT, allowNull: true, field: 'cancellation_reason' })
  declare cancellationReason: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    unique: true,
    defaultValue: Sequelize.literal("generate_guest_tracking_token()"),
    field: 'guest_tracking_token',
  })
  declare guestTrackingToken: string;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @BelongsTo(() => User, { foreignKey: 'userId', as: 'user' })
  declare user: User;

  @HasMany(() => OrderItem, { foreignKey: 'orderId', as: 'items' })
  declare items: OrderItem[];
}
