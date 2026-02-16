import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  MinLength,
} from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Entrepôt Douala' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'CM-DLA' })
  @IsString()
  @MinLength(1)
  code: string;

  @ApiProperty({ example: 'Cameroon' })
  @IsString()
  @MinLength(1)
  country: string;

  @ApiProperty({ example: 'Douala' })
  @IsString()
  @MinLength(1)
  city: string;

  @ApiPropertyOptional({ example: '123 Rue de la Paix, Akwa' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '+237 233 42 00 00' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'douala@mydermalife.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
