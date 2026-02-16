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
import { Product } from './product.entity';

@Table({
  tableName: 'product_categories',
  timestamps: true,
  underscored: true,
})
export class ProductCategory extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(250),
    allowNull: false,
    unique: true,
  })
  declare slug: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string;

  @ForeignKey(() => ProductCategory)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'parent_category_id',
  })
  declare parentCategoryId: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: 'image_url',
  })
  declare imageUrl: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    field: 'sort_order',
  })
  declare sortOrder: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  })
  declare isActive: boolean;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @BelongsTo(() => ProductCategory, { foreignKey: 'parentCategoryId', as: 'parentCategory' })
  declare parentCategory: ProductCategory;

  @HasMany(() => ProductCategory, { foreignKey: 'parentCategoryId', as: 'subcategories' })
  declare subcategories: ProductCategory[];

  @HasMany(() => Product, { foreignKey: 'categoryId', as: 'products' })
  declare products: Product[];
}
