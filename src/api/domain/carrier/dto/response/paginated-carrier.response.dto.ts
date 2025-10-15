import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../../shared/dto/response/paginated.response.dto';
import { CarrierResponseDto } from './carrier.response.dto';

export class PaginatedCarrierResponseDto extends PaginatedResponseDto<CarrierResponseDto> {
  @ApiProperty({
    description: 'Array of carrier objects',
    type: [CarrierResponseDto],
  })
  data: CarrierResponseDto[];
}
