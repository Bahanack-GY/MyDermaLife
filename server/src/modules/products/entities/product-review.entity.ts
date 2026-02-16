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
import { User } from '../../users/entities/user.entity';
import { Product } from './product.entity';

@Table({
  tableName: 'product_reviews',
  timestamps: true,
  underscored: true,
})
export class ProductReview extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'product_id',
  })
  declare productId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'user_id',
  })
  declare userId: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'order_id',
  })
  declare orderId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare rating: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'review_text',
  })
  declare reviewText: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'is_verified_purchase',
  })
  declare isVerifiedPurchase: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    field: 'helpful_count',
  })
  declare helpfulCount: number;

  @Column({
    type: DataType.STRING(50),
    defaultValue: 'pending',
  })
  declare status: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'moderated_by',
  })
  declare moderatedBy: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'moderated_at',
  })
  declare moderatedAt: Date;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @BelongsTo(() => Product, { foreignKey: 'productId', as: 'product' })
  declare product: Product;

  @BelongsTo(() => User, { foreignKey: 'userId', as: 'user' })
  declare user: User;

  @BelongsTo(() => User, { foreignKey: 'moderatedBy', as: 'moderator' })
  declare moderator: User;
}
