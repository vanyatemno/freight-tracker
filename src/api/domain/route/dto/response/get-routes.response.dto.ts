import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../../shared';
import { RouteResponseDto } from './route.response.dto';

export class GetRoutesResponseDto extends PaginatedResponseDto<RouteResponseDto> {
  @ApiProperty({
    description: 'Array of route objects',
    type: [RouteResponseDto],
  })
  data: RouteResponseDto[];
}
