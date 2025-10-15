import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CarrierType, RouteStatus } from '@prisma/client';
import { SelectRecordDto } from '../../../../shared';
import { CurrencyCode } from '../../../../../shared';

export namespace UpdateRouteRequestDto {
  export class UpdateRouteParam extends SelectRecordDto {}
  export class UpdateRouteBody {
    @ApiPropertyOptional({
      description: 'Scheduled departure date and time',
      example: '2024-12-01T08:00:00.000Z',
      type: String,
    })
    @IsDateString()
    @IsOptional()
    departureDate?: string;

    @ApiPropertyOptional({
      description: 'Actual completion date and time',
      example: '2024-12-01T16:30:00.000Z',
      type: String,
    })
    @IsDateString()
    @IsOptional()
    completionDate?: string;

    @ApiPropertyOptional({
      description: 'Type of carrier required for this route',
      enum: CarrierType,
      example: CarrierType.BOX,
    })
    @IsEnum(CarrierType)
    @IsOptional()
    requiredCarrierType?: CarrierType;

    @ApiPropertyOptional({
      description: 'Price for the route',
      example: 450.0,
      type: Number,
    })
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    price?: number;

    @ApiPropertyOptional({
      description: 'Currency of the price',
      enum: CurrencyCode,
      example: CurrencyCode.EUR,
    })
    @IsEnum(CurrencyCode)
    @IsOptional()
    currency?: CurrencyCode;
  }
}

export namespace SetRouteCarrierDto {
  export class SetRouteCarrierParam extends SelectRecordDto {}

  export class SetRouteBody {
    @ApiPropertyOptional({
      description: 'ID of the assigned carrier',
      example: 'd899f5ac-228f-4974-99ac-0466c0de2e93',
    })
    @IsUUID()
    @IsOptional()
    carrierId?: string;
  }
}

export namespace UpdateRouteStatusDto {
  export class UpdateRouteStatusParam extends SelectRecordDto {}

  export class UpdateRouteStatusBody {
    @ApiPropertyOptional({
      description: 'Scheduled departure date and time',
      example: '2024-12-01T08:00:00.000Z',
      type: String,
    })
    @IsDateString()
    @IsOptional()
    departureDateActual?: Date;

    @ApiPropertyOptional({
      description: 'Actual completion date and time',
      example: '2024-12-01T16:30:00.000Z',
      type: String,
    })
    @IsDateString()
    @IsOptional()
    completionDateActual?: Date;

    @ApiPropertyOptional({
      description: 'Status of the route',
      example: RouteStatus.IN_PROGRESS,
      enum: RouteStatus,
    })
    @IsEnum(RouteStatus)
    @IsOptional()
    status?: RouteStatus;
  }
}
