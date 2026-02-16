import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShippingAddressDto, PaymentMethod } from './checkout-shared-cart.dto';

export class CheckoutDto {
  @ApiPropertyOptional({
    description: 'Email (required for guests, optional for logged-in users)',
    example: 'buyer@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  @MinLength(1)
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsString()
  @MinLength(1)
  lastName: string;

  @ApiProperty({ description: 'Phone number', example: '+237600000000' })
  @IsString()
  @MinLength(1)
  phone: string;

  @ApiProperty({ type: ShippingAddressDto })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.MOBILE_MONEY })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: 'Optional note for the order' })
  @IsOptional()
  @IsString()
  notes?: string;
}
