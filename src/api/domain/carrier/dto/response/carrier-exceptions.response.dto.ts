import { ApiProperty } from '@nestjs/swagger';

export class CarrierNotFoundException {
  @ApiProperty({
    example: 404,
  })
  statusCode: number;

  @ApiProperty({
    example: 'Carrier with specified ID has been not found',
  })
  message: string;

  @ApiProperty({
    example: 'Not Found',
  })
  error: string;
}

export class CarrierBadRequestException {
  @ApiProperty({
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    example: 'Can not edit carrier while fulfilling order',
  })
  message: string;

  @ApiProperty({
    example: 'Bad Request',
  })
  error: string;
}

export class CarrierUnprocessableEntityException {
  @ApiProperty({
    example: 422,
  })
  statusCode: number;

  @ApiProperty({
    example: 'Currency has to be defined in order to update rate',
  })
  message: string;

  @ApiProperty({
    example: 'Unprocessable Entity',
  })
  error: string;
}
