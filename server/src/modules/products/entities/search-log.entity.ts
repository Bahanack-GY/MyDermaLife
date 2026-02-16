import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';

@Table({
  tableName: 'search_logs',
  timestamps: false,
  underscored: true,
})
export class SearchLog extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  declare userId: string | null;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare sessionToken: string | null;

  @Column({ type: DataType.STRING(500), allowNull: false })
  declare searchQuery: string;

  @Column({ type: DataType.JSONB, defaultValue: {} })
  declare filters: Record<string, any>;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare resultsCount: number;

  @Column({ type: DataType.STRING(45), allowNull: true })
  declare ipAddress: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare userAgent: string | null;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare createdAt: Date;
}
