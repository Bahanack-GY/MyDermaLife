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
import { ShoppingCart } from './shopping-cart.entity';
import { Product } from '../../products/entities/product.entity';

@Table({
  tableName: 'cart_items',
  timestamps: true,
  underscored: true,
})
export class CartItem extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => ShoppingCart)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'cart_id',
  })
  declare cartId: string;

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
    defaultValue: 1,
  })
  declare quantity: number;

  @CreatedAt
  @Column({ field: 'added_at' })
  declare addedAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @BelongsTo(() => ShoppingCart, { foreignKey: 'cartId', as: 'cart' })
  declare cart: ShoppingCart;

  @BelongsTo(() => Product, { foreignKey: 'productId', as: 'product' })
  declare product: Product;
}
