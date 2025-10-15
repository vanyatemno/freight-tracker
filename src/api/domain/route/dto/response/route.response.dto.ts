import { ApiProperty } from '@nestjs/swagger';
import { CarrierType, RouteStatus } from '@prisma/client';
import { CarrierResponseDto } from '../../../carrier';

export class RouteResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the route',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Starting point coordinates',
    example: '52.2297,21.0122',
  })
  startPoint: string;

  @ApiProperty({
    description: 'End point coordinates',
    example: '51.5074,0.1278',
  })
  endPoint: string;

  @ApiProperty({
    description: 'Distance in meters',
    example: 1500.75,
  })
  distance: number;

  @ApiProperty({
    description: 'Planned departure date',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  departureDate?: Date;

  @ApiProperty({
    description: 'Planned completion date',
    example: '2023-01-02T00:00:00.000Z',
    required: false,
  })
  completionDate?: Date;

  @ApiProperty({
    description: 'Actual departure date',
    example: '2023-01-01T01:30:00.000Z',
    required: false,
  })
  departureDateActual?: Date;

  @ApiProperty({
    description: 'Actual completion date',
    example: '2023-01-02T02:15:00.000Z',
    required: false,
  })
  completionDateActual?: Date;

  @ApiProperty({
    description: 'Required carrier type for this route',
    enum: CarrierType,
    example: CarrierType.BOX,
  })
  requiredCarrierType: CarrierType;

  @ApiProperty({
    description: 'Fee paid to carrier in USD',
    example: 250.5,
    required: false,
  })
  carrierFee?: number;

  @ApiProperty({
    description: 'Price of the route in USD',
    example: 500.75,
  })
  price: number;

  @ApiProperty({
    description: 'Current status of the route',
    enum: RouteStatus,
    example: RouteStatus.AWAITING_DISPATCH,
  })
  status: RouteStatus;

  @ApiProperty({
    description: 'ID of the assigned carrier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  carrierId?: string;

  @ApiProperty({
    description: 'Assigned carrier details',
    type: CarrierResponseDto,
    required: false,
  })
  carrier?: CarrierResponseDto;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
