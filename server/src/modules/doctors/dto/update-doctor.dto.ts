import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DoctorStatus } from '../entities/doctor.entity';
import { EducationDto, CertificationDto } from './create-doctor.dto';

export class UpdateDoctorDto {
  @ApiPropertyOptional({ example: 'DRM-CM-2020-001', description: 'Medical license number' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({ example: 'Dermatologie esthétique', description: 'Specialization' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({ example: 8, description: 'Years of experience' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(70)
  @Type(() => Number)
  yearsOfExperience?: number;

  @ApiPropertyOptional({ example: 'Updated bio...', description: 'Doctor bio' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ type: [EducationDto], description: 'Education history' })
  @IsOptional()
  @IsArray()
  education?: EducationDto[];

  @ApiPropertyOptional({ type: [CertificationDto], description: 'Certifications' })
  @IsOptional()
  @IsArray()
  certifications?: CertificationDto[];

  @ApiPropertyOptional({ example: ['French', 'English', 'Spanish'], description: 'Languages spoken' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languagesSpoken?: string[];

  @ApiPropertyOptional({ example: true, description: 'Is doctor available for consultations' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: 25000, description: 'Consultation fee' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  consultationFee?: number;

  @ApiPropertyOptional({ example: 25000, description: 'Video consultation fee' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  videoConsultationFee?: number;

  @ApiPropertyOptional({ example: 'base64:image/png...', description: 'Doctor signature' })
  @IsOptional()
  @IsString()
  signature?: string;

  @ApiPropertyOptional({ example: 'active', enum: DoctorStatus, description: 'Doctor status' })
  @IsOptional()
  @IsEnum(DoctorStatus)
  status?: DoctorStatus;
}
