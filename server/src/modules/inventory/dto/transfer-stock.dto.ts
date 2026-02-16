import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsInt, IsString, IsOptional, Min, MinLength } from 'class-validator';

export class TransferStockDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  sourceWarehouseId: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  destinationWarehouseId: string;

  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 'Rebalance stock between warehouses' })
  @IsString()
  @MinLength(3)
  reason: string;

  @ApiPropertyOptional({ example: 'Monthly stock redistribution' })
  @IsOptional()
  @IsString()
  notes?: string;
}
