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
import { SupplierProduct } from './supplier-product.entity';

@Table({
  tableName: 'suppliers',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Supplier extends Model {
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
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  declare code: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  declare phone: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare address: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare city: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare country: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
    field: 'contact_person',
  })
  declare contactPerson: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  declare website: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
    field: 'payment_terms',
  })
  declare paymentTerms: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'lead_time_days',
  })
  declare leadTimeDays: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  })
  declare isActive: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare notes: string;

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

  @HasMany(() => SupplierProduct, { foreignKey: 'supplierId', as: 'products' })
  declare products: SupplierProduct[];
}
