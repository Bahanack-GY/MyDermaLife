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
import { DoctorAvailability } from './doctor-availability.entity';
import { Type } from 'class-transformer';

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum DoctorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
}

@Table({
  tableName: 'doctors',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Doctor extends Model {
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
    unique: true,
    field: 'user_id',
  })
  declare userId: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
    field: 'license_number',
  })
  declare licenseNumber: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
  })
  declare specialization: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'years_of_experience',
  })
  declare yearsOfExperience: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare bio: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare education: object[];

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare certifications: object[];

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    field: 'languages_spoken',
  })
  declare languagesSpoken: string[];

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    field: 'consultation_fee',
  })
  declare consultationFee: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    field: 'video_consultation_fee',
  })
  declare videoConsultationFee: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare signature: string;

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
    field: 'total_consultations',
  })
  declare totalConsultations: number;

  @Column({
    type: DataType.ENUM(...Object.values(VerificationStatus)),
    defaultValue: VerificationStatus.PENDING,
    field: 'verification_status',
  })
  declare verificationStatus: VerificationStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'verified_at',
  })
  declare verifiedAt: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'verified_by',
  })
  declare verifiedBy: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: 'is_available',
  })
  declare isAvailable: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(DoctorStatus)),
    defaultValue: DoctorStatus.ACTIVE,
  })
  declare status: DoctorStatus;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @DeletedAt
  @Column({ field: 'deleted_at' })
  declare deletedAt: Date;

  @Type(() => User)
  @BelongsTo(() => User, { foreignKey: 'userId', as: 'user' })
  declare user: User;

  @BelongsTo(() => User, { foreignKey: 'verifiedBy', as: 'verifier' })
  declare verifier: User;

  @HasMany(() => DoctorAvailability)
  declare availability: DoctorAvailability[];
}
