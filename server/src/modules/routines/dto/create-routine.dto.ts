import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';


export class RoutineProductItemDto {
  @ApiProperty({ description: 'Product UUID' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Display order (1, 2, 3...)', example: 1 })
  @IsInt()
  @Min(1)
  stepOrder: number;

  @ApiProperty({ description: 'Step label, e.g. "Nettoyant", "Sérum"', example: 'Nettoyant' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  stepLabel: string;
}

export class CreateRoutineDto {
  @ApiProperty({ description: 'Routine name', example: 'Routine Anti-Acné' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  name: string;

  @ApiProperty({ description: 'URL-friendly slug', example: 'routine-anti-acne' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(350)
  slug: string;

  @ApiPropertyOptional({ description: 'Routine description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the routine is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ type: [RoutineProductItemDto], description: 'Products in the routine' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineProductItemDto)
  @IsOptional()
  items?: RoutineProductItemDto[];
}
