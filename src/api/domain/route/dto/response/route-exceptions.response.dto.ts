import { ApiProperty } from '@nestjs/swagger';

export class RouteNotFoundException {
  @ApiProperty({
    example: 404,
  })
  statusCode: number;

  @ApiProperty({
    example: 'Route with provided ID has been not found.',
  })
  message: string;

  @ApiProperty({
    example: 'Not Found',
  })
  error: string;
}

export class RouteBadRequestException {
  @ApiProperty({
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    example: 'The departure date can not be greater than completionDate',
  })
  message: string;

  @ApiProperty({
    example: 'Bad Request',
  })
  error: string;
}

export class CarrierAlreadyAssignedException {
  @ApiProperty({
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    example: 'Carrier has been already assigned to this route',
  })
  message: string;

  @ApiProperty({
    example: 'Bad Request',
  })
  error: string;
}

export class PriceRangeException {
  @ApiProperty({
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    example: 'Minimum price can not be greater than maximum price',
  })
  message: string;

  @ApiProperty({
    example: 'Bad Request',
  })
  error: string;
}
