import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductImageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  imageUrl: string;

  @ApiPropertyOptional()
  altText?: string;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  isPrimary: boolean;
}

export class ParentCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;
}

export class ProductCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ type: ParentCategoryResponseDto })
  parentCategory?: ParentCategoryResponseDto;
}

export class ProductResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'SKU-CREAM-001' })
  sku: string;

  @ApiProperty({ example: 'Hydrating Face Cream' })
  name: string;

  @ApiProperty({ example: 'hydrating-face-cream' })
  slug: string;

  @ApiPropertyOptional({ example: 'L\'Oréal' })
  brandName?: string;

  @ApiPropertyOptional({ example: 'A deeply hydrating cream.' })
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'This luxurious cream delivers deep hydration using natural ingredients...' })
  longDescription?: string;

  @ApiPropertyOptional({ type: ProductCategoryResponseDto })
  category?: ProductCategoryResponseDto;

  @ApiProperty({ example: 15000 })
  price: number;

  @ApiPropertyOptional({ example: 20000 })
  compareAtPrice?: number;

  @ApiProperty({ example: false })
  requiresPrescription: boolean;

  @ApiPropertyOptional({ example: ['Hyaluronic Acid'] })
  ingredients?: string[];

  @ApiPropertyOptional({ example: 'Apply twice daily.' })
  usageInstructions?: string;

  @ApiPropertyOptional({ example: 'For external use only.' })
  warnings?: string;

  @ApiPropertyOptional({ example: ['Deep hydration'] })
  benefits?: string[];

  @ApiPropertyOptional({ example: ['dry', 'normal'] })
  skinTypes?: string[];

  @ApiPropertyOptional({ example: ['acne'] })
  conditionsTreated?: string[];

  @ApiPropertyOptional({ example: 8000 })
  costPrice?: number;

  @ApiPropertyOptional({ example: false })
  isPrescriptionOnly?: boolean;

  @ApiProperty({ example: 100 })
  stockQuantity: number;

  @ApiPropertyOptional({ example: 10 })
  lowStockThreshold?: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: false })
  isFeatured: boolean;

  @ApiProperty({ example: false })
  isNew: boolean;

  @ApiProperty({ example: false })
  isBestSeller: boolean;

  @ApiProperty({ example: 4.5 })
  rating: number;

  @ApiProperty({ example: 25 })
  totalReviews: number;

  @ApiProperty({ example: 150 })
  totalSales: number;

  @ApiPropertyOptional({ example: 250 })
  weightGrams?: number;

  @ApiPropertyOptional({ example: { length: 10, width: 5, height: 15 } })
  dimensions?: object;

  @ApiPropertyOptional({ example: ['skincare', 'moisturizer'] })
  tags?: string[];

  @ApiPropertyOptional({ example: 'Hydrating Face Cream | MyDermaLife' })
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'Shop our hydrating face cream.' })
  metaDescription?: string;

  @ApiPropertyOptional({ type: [ProductImageResponseDto] })
  images?: ProductImageResponseDto[];

  @ApiPropertyOptional({ description: 'Routines this product belongs to' })
  routines?: any[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedProductsResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  data: ProductResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}
