import { ApiProperty } from '@nestjs/swagger';
import { CarrierStatus, CarrierType } from '@prisma/client';

export class CarrierResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the carrier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'License plate of the carrier',
    example: 'ABC123',
  })
  licensePlate: string;

  @ApiProperty({
    description: 'Model of the carrier',
    example: 'Volvo FH16',
  })
  model: string;

  @ApiProperty({
    description: 'Type of the carrier',
    enum: CarrierType,
    example: CarrierType.BOX,
  })
  type: CarrierType;

  @ApiProperty({
    description: 'Registration date of the carrier',
    example: '2023-01-01T00:00:00.000Z',
  })
  registrationDate: Date;

  @ApiProperty({
    description: 'Current status of the carrier',
    enum: CarrierStatus,
    example: CarrierStatus.AVAILABLE,
  })
  status: CarrierStatus;

  @ApiProperty({
    description: 'Rate per kilometer in USD',
    example: 2.5,
  })
  rate: number;

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
