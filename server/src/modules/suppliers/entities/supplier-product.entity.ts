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
import { Supplier } from './supplier.entity';
import { Product } from '../../products/entities/product.entity';

@Table({
  tableName: 'supplier_products',
  timestamps: true,
  underscored: true,
})
export class SupplierProduct extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Supplier)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'supplier_id',
  })
  declare supplierId: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'product_id',
  })
  declare productId: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'supplier_sku',
  })
  declare supplierSku: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    field: 'cost_price',
  })
  declare costPrice: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'lead_time_days',
  })
  declare leadTimeDays: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1,
    field: 'min_order_quantity',
  })
  declare minOrderQuantity: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'is_preferred',
  })
  declare isPreferred: boolean;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @BelongsTo(() => Supplier, { foreignKey: 'supplierId', as: 'supplier' })
  declare supplier: Supplier;

  @BelongsTo(() => Product, { foreignKey: 'productId', as: 'product' })
  declare product: Product;
}
