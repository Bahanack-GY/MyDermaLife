import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsInt,
  Min,
  MinLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

function ToBoolean() {
  return Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true' || value === '1') return true;
      if (value.toLowerCase() === 'false' || value === '0') return false;
    }
    return value;
  });
}

export class CreateCategoryDto {
  @ApiProperty({ example: 'Moisturizers', description: 'Category name' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'moisturizers', description: 'URL-friendly slug' })
  @IsString()
  @MinLength(2)
  slug: string;

  @ApiPropertyOptional({ example: 'Hydrating products for all skin types.', description: 'Category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Parent category ID' })
  @IsOptional()
  @IsUUID()
  parentCategoryId?: string;

  @ApiPropertyOptional({ example: 0, description: 'Sort order' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true, description: 'Is category active' })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isActive?: boolean;
}
