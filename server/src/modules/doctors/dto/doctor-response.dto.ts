import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationStatus, DoctorStatus } from '../entities/doctor.entity';
import { AvailabilityResponseDto } from './doctor-availability.dto';

export class DoctorUserProfileDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiPropertyOptional()
  profilePhoto?: string;

  @ApiPropertyOptional()
  gender?: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiPropertyOptional()
  country?: string;
}

export class DoctorUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional({ type: DoctorUserProfileDto })
  profile?: DoctorUserProfileDto;
}

export class DoctorResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: 'DRM-CM-2020-001' })
  licenseNumber: string;

  @ApiPropertyOptional({ example: 'Dermatologie générale' })
  specialization?: string;

  @ApiPropertyOptional({ example: 5 })
  yearsOfExperience?: number;

  @ApiPropertyOptional({ example: 'Experienced dermatologist...' })
  bio?: string;

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  education?: object[];

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  certifications?: object[];

  @ApiPropertyOptional({ example: ['French', 'English'] })
  languagesSpoken?: string[];

  @ApiPropertyOptional({ example: 15000 })
  consultationFee?: number;

  @ApiPropertyOptional({ example: 12000 })
  videoConsultationFee?: number;

  @ApiProperty({ example: 4.5 })
  rating: number;

  @ApiProperty({ example: 25 })
  totalReviews: number;

  @ApiProperty({ example: 150 })
  totalConsultations: number;

  @ApiProperty({ example: 'verified', enum: VerificationStatus })
  verificationStatus: VerificationStatus;

  @ApiPropertyOptional()
  verifiedAt?: Date;

  @ApiProperty({ example: true })
  isAvailable: boolean;

  @ApiProperty({ example: 'active', enum: DoctorStatus })
  status: DoctorStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ type: DoctorUserDto })
  user?: DoctorUserDto;

  @ApiPropertyOptional({ type: [AvailabilityResponseDto] })
  availability?: AvailabilityResponseDto[];
}

export class PaginatedDoctorsResponseDto {
  @ApiProperty({ type: [DoctorResponseDto] })
  data: DoctorResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}
