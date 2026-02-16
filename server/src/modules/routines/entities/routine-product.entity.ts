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
import { Routine } from './routine.entity';
import { Product } from '../../products/entities/product.entity';

@Table({
  tableName: 'routine_products',
  timestamps: true,
  underscored: true,
})
export class RoutineProduct extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Routine)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'routine_id',
  })
  declare routineId: string;

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
    field: 'step_order',
  })
  declare stepOrder: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'step_label',
  })
  declare stepLabel: string;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @BelongsTo(() => Routine, { foreignKey: 'routineId', as: 'routine' })
  declare routine: Routine;

  @BelongsTo(() => Product, { foreignKey: 'productId', as: 'product' })
  declare product: Product;
}
