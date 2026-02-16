import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsInt, IsString, IsOptional, MinLength } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  warehouseId: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 10, description: 'Positive to add, negative to deduct' })
  @IsInt()
  quantity: number;

  @ApiProperty({ example: 'Inventory count correction', description: 'Reason for adjustment (min 3 chars)' })
  @IsString()
  @MinLength(3)
  reason: string;

  @ApiPropertyOptional({ example: 'Found extra units during audit' })
  @IsOptional()
  @IsString()
  notes?: string;
}
