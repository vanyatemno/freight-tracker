import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CarrierService } from './carrier.service';
import {
  CarrierBadRequestException,
  CarrierNotFoundException,
  CarrierResponseDto,
  CarrierUnprocessableEntityException,
  CreateCarrierRequestDto,
  GetCarriersRequestDto,
  PaginatedCarrierResponseDto,
  UpdateCarrierRequestDto,
} from './dto';
import { SelectRecordDto } from '../../shared';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('/carriers')
@ApiBearerAuth()
@ApiTags('Carriers')
export class CarrierController {
  constructor(private readonly carrierService: CarrierService) {}

  @Get('/')
  @ApiOperation({
    summary:
      'Returns a paginated list of carriers. Allows filtering by status and searching by model or license plate.',
  })
  @ApiOkResponse({
    description: 'Returns a paginated list of carriers',
    type: PaginatedCarrierResponseDto,
  })
  async get(@Query() query: GetCarriersRequestDto) {
    return this.carrierService.getAll(query);
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Returns a single carrier by its unique identifier.',
  })
  @ApiOkResponse({
    description: 'Returns a carrier by ID',
    type: CarrierResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Carrier not found',
    type: CarrierNotFoundException,
  })
  async getCarrierById(@Param() { id }: SelectRecordDto) {
    return this.carrierService.getOne(id);
  }

  @Post('/')
  @ApiOperation({
    summary:
      'Creates a new carrier. The provided rate is converted to EUR. A carrier with the same license plate cannot be created twice.',
  })
  @ApiCreatedResponse({
    description: 'Carrier created successfully',
    type: CarrierResponseDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Currency conversion error',
    type: CarrierUnprocessableEntityException,
  })
  async create(@Body() data: CreateCarrierRequestDto) {
    return this.carrierService.create(data);
  }

  @Put('/:id')
  @ApiOperation({
    summary:
      "Updates an existing carrier. It's not possible to update a carrier that is currently fulfilling an order (status is BUSY). If the rate is updated, the currency must be provided, and the rate will be converted to EUR.",
  })
  @ApiOkResponse({
    description: 'Carrier updated successfully',
    type: CarrierResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Carrier not found',
    type: CarrierNotFoundException,
  })
  @ApiBadRequestResponse({
    description: 'Cannot edit carrier while fulfilling order',
    type: CarrierBadRequestException,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Currency has to be defined in order to update rate',
    type: CarrierUnprocessableEntityException,
  })
  async update(
    @Param() param: UpdateCarrierRequestDto.UpdateCarrierParam,
    @Body() body: UpdateCarrierRequestDto.UpdateCarrierBody,
  ) {
    return this.carrierService.update(param, body);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Deletes a carrier by its unique identifier.' })
  @ApiOkResponse({
    description: 'Carrier deleted successfully',
    type: CarrierResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Carrier not found',
    type: CarrierNotFoundException,
  })
  async delete(@Param() params: SelectRecordDto) {
    return this.carrierService.delete(params);
  }
}
