import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RouteStatus } from '@prisma/client';
import { PaginationRequestDto } from '../../../../shared';

export class GetRoutesRequestDto extends PaginationRequestDto {
  @IsEnum(RouteStatus)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Desired status of carriers.',
    enum: RouteStatus,
  })
  status?: RouteStatus;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Maximum price of the route',
  })
  maxPrice?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Minimum price of the route',
  })
  minPrice?: number;
}
