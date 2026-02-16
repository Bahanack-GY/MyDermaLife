import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsUUID,
  Min,
  Max,
  MinLength,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EducationDto {
  @ApiProperty({ example: 'Docteur en Médecine' })
  @IsString()
  degree: string;

  @ApiProperty({ example: 'Université de Douala' })
  @IsString()
  institution: string;

  @ApiProperty({ example: 2015 })
  @IsNumber()
  year: number;
}

export class CertificationDto {
  @ApiProperty({ example: 'Board Certified Dermatologist' })
  @IsString()
  name: string;

  @ApiProperty({ example: 2018 })
  @IsNumber()
  year: number;
}

export class CreateDoctorDto {
  @ApiProperty({ description: 'User ID to link doctor profile to' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'DRM-CM-2020-001', description: 'Medical license number' })
  @IsString()
  @MinLength(3)
  licenseNumber: string;

  @ApiPropertyOptional({ example: 'Dermatologie générale', description: 'Specialization' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({ example: 5, description: 'Years of experience' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(70)
  @Type(() => Number)
  yearsOfExperience?: number;

  @ApiPropertyOptional({ example: 'Experienced dermatologist specializing in...', description: 'Doctor bio' })
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

  @ApiPropertyOptional({ example: ['French', 'English'], description: 'Languages spoken' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languagesSpoken?: string[];
}
