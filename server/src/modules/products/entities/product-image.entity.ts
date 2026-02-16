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
import { Product } from './product.entity';

@Table({
  tableName: 'product_images',
  timestamps: true,
  underscored: true,
})
export class ProductImage extends Model {
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

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
    field: 'image_url',
  })
  declare imageUrl: string;

  @Column({
    type: DataType.STRING(300),
    allowNull: true,
    field: 'alt_text',
  })
  declare altText: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    field: 'sort_order',
  })
  declare sortOrder: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'is_primary',
  })
  declare isPrimary: boolean;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @BelongsTo(() => Product, { foreignKey: 'productId', as: 'product' })
  declare product: Product;
}
