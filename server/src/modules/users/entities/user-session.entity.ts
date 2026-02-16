import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.entity';

@Table({
  tableName: 'user_sessions',
  timestamps: false,
  underscored: true,
})
export class UserSession extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  declare userId: string;

  @Column({
    type: DataType.STRING(500),
    unique: true,
    allowNull: false,
  })
  declare token: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: 'refresh_token',
  })
  declare refreshToken: string;

  @Column({
    type: DataType.STRING(45),
    allowNull: true,
    field: 'ip_address',
  })
  declare ipAddress: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'user_agent',
  })
  declare userAgent: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'device_type',
  })
  declare deviceType: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'expires_at',
  })
  declare expiresAt: Date;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'last_activity_at',
  })
  declare lastActivityAt: Date;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'revoked_at',
  })
  declare revokedAt: Date;

  @BelongsTo(() => User)
  declare user: User;

  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get isRevoked(): boolean {
    return this.revokedAt !== null;
  }
}
