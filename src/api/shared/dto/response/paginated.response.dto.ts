import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Found data',
  })
  data: T[];

  @ApiProperty({
    description: 'Total number of records available.',
    type: Number,
  })
  total: number;
}
