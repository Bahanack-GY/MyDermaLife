import { IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: 'Product ID', example: 'uuid' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Quantity to add', example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
