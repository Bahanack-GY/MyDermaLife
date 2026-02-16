import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  HasOne,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import { UserProfile } from './user-profile.entity';
import { Type, Exclude } from 'class-transformer';

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  DELIVERY = 'delivery',
  CATALOG_MANAGER = 'catalog_manager',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  DELETED = 'deleted',
}

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(255),
    unique: true,
    allowNull: false,
  })
  declare email: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  declare phone: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'password_hash',
  })
  declare passwordHash: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    defaultValue: UserRole.PATIENT,
    allowNull: false,
  })
  declare role: UserRole;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'email_verified',
  })
  declare emailVerified: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'phone_verified',
  })
  declare phoneVerified: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    field: 'two_factor_enabled',
  })
  declare twoFactorEnabled: boolean;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: 'two_factor_secret',
  })
  declare twoFactorSecret: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserStatus)),
    defaultValue: UserStatus.ACTIVE,
  })
  declare status: UserStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'last_login_at',
  })
  declare lastLoginAt: Date;

  @Column({
    type: DataType.STRING(45),
    allowNull: true,
    field: 'last_login_ip',
  })
  declare lastLoginIp: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    field: 'failed_login_count',
  })
  declare failedLoginCount: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'locked_until',
  })
  declare lockedUntil: Date;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @DeletedAt
  @Column({ field: 'deleted_at' })
  declare deletedAt: Date;

  @Type(() => UserProfile)
  @HasOne(() => UserProfile)
  declare profile: UserProfile;

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  @BeforeCreate
  @BeforeUpdate
  static async hashPasswordHook(instance: User) {
    if (instance.changed('passwordHash') && instance.passwordHash && !instance.passwordHash.startsWith('$2b$')) {
      instance.passwordHash = await User.hashPassword(instance.passwordHash);
    }
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.passwordHash;
    delete values.twoFactorSecret;
    return values;
  }
}
