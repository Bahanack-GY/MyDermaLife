import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsInt,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReceiveItemDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  purchaseOrderItemId: string;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  quantityReceived: number;
}

export class ReceivePurchaseOrderDto {
  @ApiProperty({ type: [ReceiveItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveItemDto)
  items: ReceiveItemDto[];
}
