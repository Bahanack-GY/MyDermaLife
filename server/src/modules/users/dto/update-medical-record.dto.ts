import { IsArray, IsOptional, ValidateNested, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum MedicalConditionStatus {
    ONGOING = 'ongoing',
    RESOLVED = 'resolved',
    COMPLETED = 'completed',
}

export class MedicalHistoryItemDto {
    @ApiProperty()
    @IsString()
    condition: string;

    @ApiProperty({ enum: MedicalConditionStatus })
    @IsEnum(MedicalConditionStatus)
    status: MedicalConditionStatus;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    date?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    id?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    type?: string;
}

export class VaccineItemDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    date: string;
}

export class UpdateMedicalRecordDto {
    @ApiProperty({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allergies?: string[];

    @ApiProperty({ type: [MedicalHistoryItemDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MedicalHistoryItemDto)
    history?: MedicalHistoryItemDto[];

    @ApiProperty({ type: [VaccineItemDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VaccineItemDto)
    vaccines?: VaccineItemDto[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    clinicalNotes?: string;
}
