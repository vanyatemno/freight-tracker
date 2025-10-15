import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { RouteService } from './route.service';
import {
  CreateRouteRequestDto,
  GetRoutesRequestDto,
  GetRoutesResponseDto,
  PriceRangeException,
  RouteBadRequestException,
  RouteNotFoundException,
  RouteResponseDto,
  SetRouteCarrierDto,
  UpdateRouteRequestDto,
  UpdateRouteStatusDto,
} from './dto';
import { SelectRecordDto } from '../../shared';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

@Controller('routes')
@ApiBearerAuth()
@ApiTags('Routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  @ApiOkResponse({
    description: 'Returns a paginated list of routes',
    type: GetRoutesResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Minimum price can not be greater than maximum price',
    type: PriceRangeException,
  })
  async getAll(@Query() query: GetRoutesRequestDto) {
    return this.routeService.getAll(query);
  }

  @Get('/:id')
  @ApiOkResponse({
    description: 'Returns a route by ID',
    type: RouteResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Route not found',
    type: RouteNotFoundException,
  })
  async getOne(@Param() { id }: SelectRecordDto) {
    return this.routeService.getOne(id);
  }

  @Post()
  @ApiCreatedResponse({
    description: 'Route created successfully',
    type: RouteResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'The departure date can not be greater than completionDate or carrier is not available',
    type: RouteBadRequestException,
  })
  @ApiInternalServerErrorResponse({
    description: 'The distance between the coordinates can not be calculated',
  })
  @ApiNotFoundResponse({
    description: 'Carrier not found',
    type: RouteNotFoundException,
  })
  async create(@Body() body: CreateRouteRequestDto) {
    return this.routeService.create(body);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update route basic info',
  })
  @ApiOkResponse({
    description: 'Route updated successfully',
    type: RouteResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Route not found',
    type: RouteNotFoundException,
  })
  @ApiBadRequestResponse({
    description:
      'Departure date can not be greater than completion date, carrier already assigned, or carrier not available',
    type: RouteBadRequestException,
  })
  async update(
    @Param() param: UpdateRouteRequestDto.UpdateRouteParam,
    @Body() body: UpdateRouteRequestDto.UpdateRouteBody,
  ) {
    return this.routeService.update(param, body);
  }

  @Put(':id/carrier')
  @ApiOperation({
    description: 'Assign carrier to the route',
  })
  @ApiOperation({
    description: 'Sets carrier for the route',
  })
  @ApiOkResponse({
    description: 'Route updated successfully',
    type: RouteResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Route not found',
    type: RouteNotFoundException,
  })
  @ApiBadRequestResponse({
    description: 'Carrier is not available or is already set',
    type: RouteBadRequestException,
  })
  async setCarrier(
    @Param() { id: routeId }: SetRouteCarrierDto.SetRouteCarrierParam,
    @Body() { carrierId }: SetRouteCarrierDto.SetRouteBody,
  ) {
    return this.routeService.setCarrier(routeId, carrierId);
  }

  @Put(':id/status')
  @ApiOperation({
    description: 'Update route status',
  })
  @ApiOkResponse({
    description: 'Route updated successfully',
    type: RouteResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Route not found',
    type: RouteNotFoundException,
  })
  @ApiBadRequestResponse({
    type: RouteBadRequestException,
  })
  async updateStatus(
    @Param() { id: routeId }: UpdateRouteStatusDto.UpdateRouteStatusParam,
    @Body() body: UpdateRouteStatusDto.UpdateRouteStatusBody,
  ) {
    return this.routeService.updateStatus(routeId, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete route by ID',
  })
  @ApiOkResponse({
    description: 'Route deleted successfully',
    type: RouteResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Route not found',
    type: RouteNotFoundException,
  })
  async delete(@Param() param: SelectRecordDto, @Res() res: Response) {
    await this.routeService.delete(param);
    res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
