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
import { User } from './user.entity';
import { Exclude } from 'class-transformer';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

@Table({
  tableName: 'user_profiles',
  timestamps: true,
  underscored: true,
})
export class UserProfile extends Model {
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
    field: 'first_name',
  })
  declare firstName: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'last_name',
  })
  declare lastName: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
    field: 'date_of_birth',
  })
  declare dateOfBirth: Date;

  @Column({
    type: DataType.ENUM(...Object.values(Gender)),
    allowNull: true,
  })
  declare gender: Gender;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'profile_photo',
  })
  declare profilePhoto: string;

  @Column({
    type: DataType.STRING(10),
    defaultValue: 'en',
  })
  declare language: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare timezone: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: 'address_line1',
  })
  declare addressLine1: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: 'address_line2',
  })
  declare addressLine2: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare city: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare state: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare country: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    field: 'postal_code',
  })
  declare postalCode: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'emergency_contact',
  })
  declare emergencyContact: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'emergency_phone',
  })
  declare emergencyPhone: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'insurance_number',
  })
  declare insuranceNumber: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    field: 'medical_record',
    defaultValue: {
      allergies: [],
      history: [],
      vaccines: [],
      currentTreatments: [],
      skinRiskFactors: {}
    }
  })
  declare medicalRecord: {
    allergies: string[];
    history: Array<{ condition: string; status: 'ongoing' | 'resolved'; date?: string }>;
    vaccines: Array<{ name: string; date: string }>;
    currentTreatments?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      startDate: string;
      prescribedBy?: string;
    }>;
    skinRiskFactors?: {
      sunExposure?: string;
      profession?: string;
      leisure?: string;
      habitat?: string;
      productsUsed?: string;
      familyHistoryCancer?: boolean;
      familyHistorySkin?: string;
    };
    clinicalNotes?: string;
  };

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @Exclude()
  @BelongsTo(() => User)
  declare user: User;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
