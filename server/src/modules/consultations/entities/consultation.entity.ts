import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
    HasMany,
    HasOne,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Type } from 'class-transformer';

export enum ConsultationType {
    VIDEO = 'video',
    CHAT = 'chat',
    IN_PERSON = 'in_person',
}

export enum ConsultationStatus {
    PROPOSED = 'proposed',
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    NO_SHOW = 'no_show',
    REJECTED = 'rejected',
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    REFUNDED = 'refunded',
    FAILED = 'failed',
}

export enum TranscriptionStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

@Table({
    tableName: 'consultations',
    timestamps: true,
    underscored: true,
})
export class Consultation extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
    })
    declare id: string;

    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false,
    })
    declare consultationNumber: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'patient_id',
    })
    declare patientId: string;

    @Type(() => User)
    @BelongsTo(() => User, 'patientId')
    declare patient: User;

    @ForeignKey(() => Doctor)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'doctor_id',
    })
    declare doctorId: string;

    @Type(() => Doctor)
    @BelongsTo(() => Doctor)
    declare doctor: Doctor;

    @Column({
        type: DataType.ENUM(...Object.values(ConsultationType)),
        allowNull: false,
    })
    declare consultationType: ConsultationType;

    @Column({
        type: DataType.ENUM(...Object.values(ConsultationStatus)),
        defaultValue: ConsultationStatus.SCHEDULED,
    })
    declare status: ConsultationStatus;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare scheduledDate: Date;

    @Column(DataType.INTEGER)
    declare durationMinutes: number;

    @Column(DataType.DATE)
    declare actualStartTime: Date;

    @Column(DataType.DATE)
    declare actualEndTime: Date;

    @Column(DataType.TEXT)
    declare chiefComplaint: string;

    @Column(DataType.JSONB)
    declare symptoms: any;

    @Column(DataType.TEXT)
    declare diagnosis: string;

    @Column(DataType.TEXT)
    declare treatmentPlan: string;

    @Column(DataType.TEXT)
    declare notes: string;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    declare followUpRequired: boolean;

    @Column(DataType.DATEONLY)
    declare followUpDate: Date;

    @Column(DataType.STRING)
    declare videoCallUrl: string;

    @Column(DataType.STRING)
    declare videoRecordingUrl: string;

    @Column(DataType.DECIMAL(10, 2))
    declare fee: number;

    @Column({
        type: DataType.ENUM(...Object.values(PaymentStatus)),
        defaultValue: PaymentStatus.PENDING,
    })
    declare paymentStatus: PaymentStatus;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        field: 'cancelled_by',
    })
    declare cancelledBy: string;

    @Column(DataType.TEXT)
    declare cancellationReason: string;

    @Column(DataType.DATE)
    declare cancelledAt: Date;

    @Column(DataType.INTEGER)
    declare rating: number;

    @Column(DataType.TEXT)
    declare review: string;

    @Column(DataType.TEXT)
    declare transcription: string;

    @Column({
        type: DataType.STRING,
        defaultValue: TranscriptionStatus.PENDING,
    })
    declare transcriptionStatus: TranscriptionStatus;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    declare isPatientOnline: boolean;
}
