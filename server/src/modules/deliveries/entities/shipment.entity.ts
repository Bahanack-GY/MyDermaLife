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
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';

@Table({
  tableName: 'shipments',
  timestamps: true,
  underscored: true,
})
export class Shipment extends Model {
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

  @Column({ type: DataType.STRING(255), allowNull: true, field: 'tracking_number' })
  declare trackingNumber: string;

  @Column({ type: DataType.STRING(100), allowNull: true, defaultValue: 'Lis Course' })
  declare carrier: string;

  @Column({ type: DataType.STRING(50), defaultValue: 'preparing' })
  declare status: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'assigned_driver',
  })
  declare assignedDriver: string;

  @Column({ type: DataType.DATE, allowNull: true, field: 'shipped_at' })
  declare shippedAt: Date;

  @Column({ type: DataType.DATEONLY, allowNull: true, field: 'estimated_delivery' })
  declare estimatedDelivery: string;

  @Column({ type: DataType.DATE, allowNull: true, field: 'delivered_at' })
  declare deliveredAt: Date;

  @Column({ type: DataType.DATE, allowNull: true, field: 'picked_up_at' })
  declare pickedUpAt: Date;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare notes: string;

  @Column({ type: DataType.TEXT, allowNull: true, field: 'delivery_notes' })
  declare deliveryNotes: string;

  @Column({ type: DataType.STRING(500), allowNull: true, field: 'proof_of_delivery_url' })
  declare proofOfDeliveryUrl: string;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @BelongsTo(() => Order, { foreignKey: 'orderId', as: 'order' })
  declare order: Order;

  @BelongsTo(() => User, { foreignKey: 'assignedDriver', as: 'driver' })
  declare driver: User;
}
