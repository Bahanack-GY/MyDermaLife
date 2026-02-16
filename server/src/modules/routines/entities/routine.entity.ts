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
import { RoutineProduct } from './routine-product.entity';

@Table({
  tableName: 'routines',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Routine extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

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
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: 'image_url',
  })
  declare imageUrl: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  })
  declare isActive: boolean;

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

  @BelongsTo(() => User, { foreignKey: 'createdBy', as: 'creator' })
  declare creator: User;

  @HasMany(() => RoutineProduct, { foreignKey: 'routineId', as: 'products' })
  declare products: RoutineProduct[];
}
