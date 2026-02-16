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
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';

@Table({
  tableName: 'shopping_carts',
  timestamps: true,
  underscored: true,
})
export class ShoppingCart extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'user_id',
  })
  declare userId: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    unique: true,
    field: 'session_token',
  })
  declare sessionToken: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    unique: true,
    field: 'share_token',
  })
  declare shareToken: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'expires_at',
  })
  declare expiresAt: Date;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @BelongsTo(() => User, { foreignKey: 'userId', as: 'user' })
  declare user: User;

  @HasMany(() => CartItem, { foreignKey: 'cartId', as: 'items' })
  declare items: CartItem[];
}
