import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { ProductCategory } from './product-category.entity';
import { ProductImage } from './product-image.entity';


@Table({
  tableName: 'products',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Product extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  declare sku: string;

  @Column({
    type: DataType.STRING(300),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(350),
    allowNull: false,
    unique: true,
  })
  declare slug: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
    field: 'brand_name',
  })
  declare brandName: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: 'short_description',
  })
  declare shortDescription: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'long_description',
  })
  declare longDescription: string;

  @ForeignKey(() => ProductCategory)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'category_id',
  })
  declare categoryId: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare price: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    field: 'compare_at_price',
  })
  declare compareAtPrice: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    field: 'cost_price',
  })
  declare costPrice: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'requires_prescription',
  })
  declare requiresPrescription: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'is_prescription_only',
  })
  declare isPrescriptionOnly: boolean;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare ingredients: string[];

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'usage_instructions',
  })
  declare usageInstructions: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare warnings: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare benefits: string[];

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    field: 'skin_types',
  })
  declare skinTypes: string[];

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    field: 'conditions_treated',
  })
  declare conditionsTreated: string[];

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    field: 'stock_quantity',
  })
  declare stockQuantity: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 10,
    field: 'low_stock_threshold',
  })
  declare lowStockThreshold: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  })
  declare isActive: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'is_featured',
  })
  declare isFeatured: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'is_new',
  })
  declare isNew: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'is_best_seller',
  })
  declare isBestSeller: boolean;

  @Column({
    type: DataType.DECIMAL(2, 1),
    defaultValue: 0,
  })
  declare rating: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    field: 'total_reviews',
  })
  declare totalReviews: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    field: 'total_sales',
  })
  declare totalSales: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'weight_grams',
  })
  declare weightGrams: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare dimensions: object;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare tags: string[];

  @Column({
    type: DataType.STRING(300),
    allowNull: true,
    field: 'meta_title',
  })
  declare metaTitle: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'meta_description',
  })
  declare metaDescription: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'created_by',
  })
  declare createdBy: string;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @DeletedAt
  @Column({ field: 'deleted_at' })
  declare deletedAt: Date;

  @BelongsTo(() => ProductCategory, { foreignKey: 'categoryId', as: 'category' })
  declare category: ProductCategory;

  @BelongsTo(() => User, { foreignKey: 'createdBy', as: 'creator' })
  declare creator: User;

  @HasMany(() => ProductImage, { foreignKey: 'productId', as: 'images' })
  declare images: ProductImage[];


}
