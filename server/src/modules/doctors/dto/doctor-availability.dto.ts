import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';



export class AvailabilitySlotDto {
  @ApiProperty({ example: 1, description: 'Day of week (0=Sunday, 6=Saturday)' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiPropertyOptional({ example: '2026-01-31', description: 'Specific date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({ example: '09:00', description: 'Start time (HH:MM or HH:MM:SS)' })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, { message: 'Invalid time format. Use HH:MM or HH:MM:SS' })
  startTime: string;

  @ApiProperty({ example: '17:00', description: 'End time (HH:MM or HH:MM:SS)' })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, { message: 'Invalid time format. Use HH:MM or HH:MM:SS' })
  endTime: string;

  @ApiPropertyOptional({ example: true, description: 'Is this slot available' })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class UpdateAvailabilityDto {
  @ApiProperty({ type: [AvailabilitySlotDto], description: 'Availability slots' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilitySlotDto)
  slots: AvailabilitySlotDto[];
}

export class AvailabilityResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  doctorId: string;

  @ApiProperty({ example: 1, description: '0=Sunday, 6=Saturday' })
  dayOfWeek: number;

  @ApiPropertyOptional({ example: '2026-01-31' })
  date?: string;

  @ApiProperty({ example: 'Monday' })
  dayName: string;

  @ApiProperty({ example: '09:00' })
  startTime: string;

  @ApiProperty({ example: '17:00' })
  endTime: string;

  @ApiProperty()
  isAvailable: boolean;
}
