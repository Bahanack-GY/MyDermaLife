import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

@Table({
    tableName: 'prescriptions',
    timestamps: true,
    underscored: true,
})
export class Prescription extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
    })
    declare id: string;

    @ForeignKey(() => Doctor)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'doctor_id',
    })
    doctorId: string;

    @BelongsTo(() => Doctor)
    doctor: Doctor;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'patient_id',
    })
    patientId: string;

    @BelongsTo(() => User)
    patient: User;

    @Column({
        type: DataType.JSONB,
        allowNull: false,
    })
    medications: any;

    @Column(DataType.STRING)
    diagnosis: string;

    @Column(DataType.TEXT)
    notes: string;

    @Column({
        type: DataType.DATE,
        defaultValue: DataType.NOW,
    })
    date: Date;

    @Column(DataType.STRING)
    pdfUrl: string;
}
