import { IsNotEmpty, IsUUID, IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePrescriptionDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    patientId: string;

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    medications: any[];

    @ApiProperty()
    @IsString()
    @IsOptional()
    diagnosis?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    notes?: string;
}
