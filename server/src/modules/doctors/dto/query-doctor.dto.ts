import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { VerificationStatus, DoctorStatus } from '../entities/doctor.entity';

export class QueryDoctorDto {
  @ApiPropertyOptional({ example: 'Dermatologie', description: 'Filter by specialization' })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({ example: 'verified', enum: VerificationStatus, description: 'Filter by verification status' })
  @IsOptional()
  @IsEnum(VerificationStatus)
  verificationStatus?: VerificationStatus;

  @ApiPropertyOptional({ example: 'active', enum: DoctorStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(DoctorStatus)
  status?: DoctorStatus;

  @ApiPropertyOptional({ example: true, description: 'Filter by availability' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: 'French', description: 'Filter by language spoken' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: 'sarah', description: 'Search by name' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  search?: string;

  @ApiPropertyOptional({ example: 0, description: 'Minimum consultation fee' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minFee?: number;

  @ApiPropertyOptional({ example: 50000, description: 'Maximum consultation fee' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxFee?: number;

  @ApiPropertyOptional({ example: 4, description: 'Minimum rating' })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ example: 1, description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'rating', description: 'Sort by field' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'DESC', enum: ['ASC', 'DESC'], description: 'Sort order' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
