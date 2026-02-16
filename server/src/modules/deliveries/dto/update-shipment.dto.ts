import { IsOptional, IsString, IsUUID, IsIn, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateShipmentDto {
  @ApiPropertyOptional({ description: 'Shipment status', enum: ['preparing', 'in_transit', 'out_for_delivery', 'delivered', 'failed'] })
  @IsOptional()
  @IsIn(['preparing', 'in_transit', 'out_for_delivery', 'delivered', 'failed'])
  status?: string;

  @ApiPropertyOptional({ description: 'Driver UUID to assign' })
  @IsOptional()
  @IsUUID()
  assignedDriver?: string;

  @ApiPropertyOptional({ description: 'Tracking number' })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({ description: 'Estimated delivery date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  estimatedDelivery?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Delivery notes' })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;

  @ApiPropertyOptional({ description: 'Proof of delivery URL' })
  @IsOptional()
  @IsString()
  proofOfDeliveryUrl?: string;
}
