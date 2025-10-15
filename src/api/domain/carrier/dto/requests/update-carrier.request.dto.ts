import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { CarrierStatus, CarrierType } from '@prisma/client';
import { Type } from 'class-transformer';
import { SelectRecordDto } from '../../../../shared';
import { CurrencyCode } from '../../../../../shared';

export namespace UpdateCarrierRequestDto {
  export class UpdateCarrierParam extends SelectRecordDto {}

  export class UpdateCarrierBody {
    @ApiPropertyOptional({
      description: 'License plate number of the carrier',
      example: 'ABC-1234',
    })
    @IsString()
    @IsOptional()
    licensePlate?: string;

    @ApiPropertyOptional({
      description: 'Model of the carrier vehicle',
      example: 'Mercedes-Benz Sprinter',
    })
    @IsString()
    @IsOptional()
    model?: string;

    @ApiPropertyOptional({
      description: 'Type of carrier vehicle',
      enum: CarrierType,
      example: CarrierType.BOX,
    })
    @IsEnum(CarrierType)
    @IsOptional()
    type?: CarrierType;

    @ApiPropertyOptional({
      description: 'Purchase date of the carrier',
      example: '2024-01-15T00:00:00.000Z',
      type: String,
    })
    @IsDateString()
    @IsOptional()
    purchaseDate?: string;

    @ApiPropertyOptional({
      description: 'Status of the carrier',
      enum: CarrierStatus,
      example: CarrierStatus.AVAILABLE,
    })
    @IsEnum(CarrierStatus)
    @IsOptional()
    status?: CarrierStatus;

    @ApiPropertyOptional({
      description: 'Price per kilometer',
      example: 1.5,
      type: Number,
    })
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    rate?: number;

    @ApiPropertyOptional({
      description: 'Currency of the rate',
      enum: CurrencyCode,
      example: CurrencyCode.EUR,
    })
    @IsEnum(CurrencyCode)
    @IsOptional()
    currency?: CurrencyCode;
  }
}
