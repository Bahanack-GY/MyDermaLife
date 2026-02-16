import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoutineProductResponseDto {
  @ApiProperty()
  stepOrder: number;

  @ApiProperty()
  stepLabel: string;

  @ApiProperty()
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    primaryImage: string | null;
  };
}

export class RoutineResponseDto {
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

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional({ type: [RoutineProductResponseDto] })
  products?: RoutineProductResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedRoutinesResponseDto {
  @ApiProperty({ type: [RoutineResponseDto] })
  data: RoutineResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
