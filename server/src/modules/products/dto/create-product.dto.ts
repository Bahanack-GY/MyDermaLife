import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  IsUUID,
  IsInt,
  Min,
  MinLength,
  MaxLength,
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

function ToJsonArray() {
  return Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return value;
  });
}

function ToJsonObject() {
  return Transform(({ value }) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'object' && parsed !== null) return parsed;
      } catch {}
    }
    return value;
  });
}

export class CreateProductDto {
  @ApiProperty({ example: 'SKU-CREAM-001', description: 'Unique product SKU' })
  @IsString()
  @MinLength(1)
  sku: string;

  @ApiProperty({ example: 'Hydrating Face Cream', description: 'Product name' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'hydrating-face-cream', description: 'URL-friendly slug' })
  @IsString()
  @MinLength(2)
  slug: string;

  @ApiPropertyOptional({ example: 'L\'Oréal', description: 'Brand name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  brandName?: string;

  @ApiPropertyOptional({ example: 'A deeply hydrating cream for all skin types.', description: 'Short product description (max 500 chars)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'This luxurious cream delivers deep hydration using natural ingredients...', description: 'Full product description' })
  @IsOptional()
  @IsString()
  longDescription?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Category ID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: 15000, description: 'Price in smallest currency unit' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ example: 20000, description: 'Compare-at / strikethrough price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 8000, description: 'Cost price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  costPrice?: number;

  @ApiPropertyOptional({ example: false, description: 'Requires prescription' })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  requiresPrescription?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Prescription only product' })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isPrescriptionOnly?: boolean;

  @ApiPropertyOptional({ example: ['Hyaluronic Acid', 'Vitamin E'], description: 'Product ingredients' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ToJsonArray()
  ingredients?: string[];

  @ApiPropertyOptional({ example: 'Apply twice daily to clean skin.', description: 'Usage instructions' })
  @IsOptional()
  @IsString()
  usageInstructions?: string;

  @ApiPropertyOptional({ example: 'For external use only.', description: 'Product warnings' })
  @IsOptional()
  @IsString()
  warnings?: string;

  @ApiPropertyOptional({ example: ['Deep hydration', 'Anti-aging'], description: 'Product benefits' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ToJsonArray()
  benefits?: string[];

  @ApiPropertyOptional({ example: ['dry', 'normal', 'combination'], description: 'Suitable skin types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ToJsonArray()
  skinTypes?: string[];

  @ApiPropertyOptional({ example: ['acne', 'hyperpigmentation'], description: 'Conditions treated' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ToJsonArray()
  conditionsTreated?: string[];

  @ApiPropertyOptional({ example: 100, description: 'Stock quantity' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  stockQuantity?: number;

  @ApiPropertyOptional({ example: 10, description: 'Low stock threshold' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ example: true, description: 'Is product active' })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Is featured product' })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Is new arrival' })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isNew?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Is best seller' })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isBestSeller?: boolean;

  @ApiPropertyOptional({ example: 250, description: 'Weight in grams' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  weightGrams?: number;

  @ApiPropertyOptional({ example: { length: 10, width: 5, height: 15 }, description: 'Dimensions' })
  @IsOptional()
  @ToJsonObject()
  dimensions?: object;

  @ApiPropertyOptional({ example: ['skincare', 'moisturizer'], description: 'Product tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ToJsonArray()
  tags?: string[];

  @ApiPropertyOptional({ example: 'Hydrating Face Cream | MyDermaLife', description: 'SEO meta title' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'Shop our hydrating face cream for all skin types.', description: 'SEO meta description' })
  @IsOptional()
  @IsString()
  metaDescription?: string;
}
