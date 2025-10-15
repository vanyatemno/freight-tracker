import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PaginationRequestDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    description: 'Requested page',
    required: true,
    example: 1,
  })
  page: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    description: 'Requested page limit',
    example: 10,
    required: true,
  })
  limit: number;
}
