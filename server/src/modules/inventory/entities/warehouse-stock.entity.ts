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
import { Warehouse } from './warehouse.entity';
import { Product } from '../../products/entities/product.entity';

@Table({
  tableName: 'warehouse_stock',
  timestamps: true,
  underscored: true,
})
export class WarehouseStock extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Warehouse)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'warehouse_id',
  })
  declare warehouseId: string;

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
    defaultValue: 0,
  })
  declare quantity: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 10,
    field: 'low_stock_threshold',
  })
  declare lowStockThreshold: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'last_restocked_at',
  })
  declare lastRestockedAt: Date;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @BelongsTo(() => Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' })
  declare warehouse: Warehouse;

  @BelongsTo(() => Product, { foreignKey: 'productId', as: 'product' })
  declare product: Product;
}
