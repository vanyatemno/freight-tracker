import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsDateString, IsPositive, IsLatLong } from 'class-validator';
import { Type } from 'class-transformer';
import { CarrierType } from '@prisma/client';
import { CurrencyCode } from '../../../../../shared';

export class CreateRouteRequestDto {
  @IsLatLong()
  @ApiProperty({
    description: 'The coordinates of the start city',
    example: '50.4504,30.5245',
  })
  startPoint: string;

  @IsLatLong()
  @ApiProperty({
    description: 'The coordinates of the end city',
    example: '52.5200,13.4050',
  })
  endPoint: string;

  @IsDateString()
  @ApiProperty({
    description: 'Scheduled departure date and time',
    example: '2024-12-01T08:00:00.000Z',
    type: String,
  })
  departureDate: string;

  @IsDateString()
  @ApiProperty({
    description: 'Actual completion date and time',
    example: '2024-12-01T16:30:00.000Z',
    type: String,
  })
  completionDate: string;

  @IsEnum(CarrierType)
  @ApiProperty({
    description: 'Type of carrier required for this route',
    enum: CarrierType,
    example: CarrierType.BOX,
  })
  requiredCarrierType: CarrierType;

  @IsPositive()
  @Type(() => Number)
  @ApiProperty({
    description: 'Price for the route',
    example: 450.0,
    type: Number,
  })
  price: number;

  @IsEnum(CurrencyCode)
  @ApiProperty({
    description: 'Currency of the price',
    enum: CurrencyCode,
    example: CurrencyCode.EUR,
  })
  currency: CurrencyCode;
}
