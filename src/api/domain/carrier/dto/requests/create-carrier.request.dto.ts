import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CarrierType } from '@prisma/client';
import { Type } from 'class-transformer';
import { CurrencyCode } from '../../../../../shared';

export class CreateCarrierRequestDto {
  @ApiProperty({
    description: 'License plate number of the carrier',
    example: 'ABC-1234',
  })
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @ApiProperty({
    description: 'Model of the carrier vehicle',
    example: 'Mercedes-Benz Sprinter',
  })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({
    description: 'Type of carrier vehicle',
    enum: CarrierType,
    example: CarrierType.TANKER,
  })
  @IsEnum(CarrierType)
  type: CarrierType;

  @ApiProperty({
    description: 'Purchase date of the carrier',
    example: '2024-01-15T00:00:00.000Z',
    type: String,
  })
  @IsDateString()
  registrationDate: string;

  @ApiProperty({
    description: 'Price per kilometer',
    example: 1.5,
    type: Number,
  })
  @IsPositive()
  @Type(() => Number)
  rate: number;

  @ApiProperty({
    description: 'Currency of the rate',
    enum: CurrencyCode,
    example: CurrencyCode.EUR,
  })
  @IsEnum(CurrencyCode)
  currency: CurrencyCode;
}
