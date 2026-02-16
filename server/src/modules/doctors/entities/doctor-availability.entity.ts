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
import { Doctor } from './doctor.entity';

@Table({
  tableName: 'doctor_availability',
  timestamps: true,
  underscored: true,
})
export class DoctorAvailability extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Doctor)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'doctor_id',
  })
  declare doctorId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'day_of_week',
    validate: {
      min: 0,
      max: 6,
    },
  })
  declare dayOfWeek: number; // 0 = Sunday, 6 = Saturday

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
    field: 'date',
  })
  declare date: string | null;

  @Column({
    type: DataType.TIME,
    allowNull: false,
    field: 'start_time',
  })
  declare startTime: string;

  @Column({
    type: DataType.TIME,
    allowNull: false,
    field: 'end_time',
  })
  declare endTime: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    field: 'is_available',
  })
  declare isAvailable: boolean;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @BelongsTo(() => Doctor)
  declare doctor: Doctor;
}
