import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VerificationStatus } from '../entities/doctor.entity';

export class VerifyDoctorDto {
  @ApiProperty({ example: 'verified', enum: ['verified', 'rejected'], description: 'Verification decision' })
  @IsEnum(['verified', 'rejected'])
  status: 'verified' | 'rejected';

  @ApiPropertyOptional({ example: 'Documents verified successfully', description: 'Verification notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
