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

export enum MedicalDocumentCategory {
    EXAM_RESULT = 'exam_result',
    DERMA_EXAM = 'derma_exam',
    CORRESPONDENCE = 'correspondence',
    BIOPSY = 'biopsy',
    ALLERGY_TEST = 'allergy_test',
    OTHER = 'other',
}

@Table({
    tableName: 'medical_documents',
    timestamps: true,
    underscored: true,
})
export class MedicalDocument extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
    })
    declare id: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'patient_id',
    })
    declare patientId: string;

    @BelongsTo(() => User)
    declare patient: User;

    @ForeignKey(() => Doctor)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'doctor_id',
    })
    declare doctorId: string;

    @BelongsTo(() => Doctor)
    declare doctor: Doctor;

    @Column({
        type: DataType.ENUM(...Object.values(MedicalDocumentCategory)),
        allowNull: false,
    })
    declare category: MedicalDocumentCategory;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare title: string;

    @Column(DataType.TEXT)
    declare description: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: 'file_url',
    })
    declare fileUrl: string;

    @Column(DataType.JSONB)
    declare metadata: any;

    @Column({
        type: DataType.DATEONLY,
        defaultValue: DataType.NOW,
    })
    declare date: string;
}
