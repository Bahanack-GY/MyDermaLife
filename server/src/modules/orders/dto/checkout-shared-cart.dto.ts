import { IsEmail, IsString, IsOptional, MinLength, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShippingAddressDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(1)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(1)
  lastName: string;

  @ApiProperty({ example: '+237600000000' })
  @IsString()
  @MinLength(1)
  phone: string;

  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  @MinLength(1)
  addressLine1: string;

  @ApiPropertyOptional({ example: 'Apt 4B' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'Douala' })
  @IsString()
  @MinLength(1)
  city: string;

  @ApiPropertyOptional({ example: 'Littoral' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: 'Cameroon' })
  @IsString()
  @MinLength(1)
  country: string;
}

export enum PaymentMethod {
  CARD = 'card',
  MOBILE_MONEY = 'mobile_money',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
}

export class CheckoutSharedCartDto {
  @ApiProperty({ description: 'Buyer email', example: 'buyer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Buyer first name', example: 'John' })
  @IsString()
  @MinLength(1)
  firstName: string;

  @ApiProperty({ description: 'Buyer last name', example: 'Doe' })
  @IsString()
  @MinLength(1)
  lastName: string;

  @ApiProperty({ description: 'Buyer phone', example: '+237600000000' })
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
