import { PaginationRequestDto } from '../../../../shared';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CarrierStatus } from '@prisma/client';

export class GetCarriersRequestDto extends PaginationRequestDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description:
      'Search keyword for carriers. Searches by model and license plate',
    required: false,
  })
  search?: string;

  @IsEnum(CarrierStatus)
  @IsOptional()
  @ApiProperty({
    description: 'Desired status of carriers.',
    enum: CarrierStatus,
    required: false,
  })
  status?: CarrierStatus;
}
