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

@Table({
    tableName: 'skin_logs',
    timestamps: true,
    underscored: true,
})
export class SkinLog extends Model {
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
        type: DataType.STRING,
        allowNull: false,
        field: 'photo_url',
    })
    declare photoUrl: string;

    @Column({
        type: DataType.DATEONLY,
        allowNull: false,
    })
    declare date: Date;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare title: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare note: string;

    @CreatedAt
    @Column({ field: 'created_at' })
    declare createdAt: Date;

    @UpdatedAt
    @Column({ field: 'updated_at' })
    declare updatedAt: Date;

    @BelongsTo(() => User)
    declare user: User;
}
