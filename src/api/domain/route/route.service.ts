import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateRouteRequestDto,
  GetRoutesRequestDto,
  UpdateRouteRequestDto,
  UpdateRouteStatusDto,
} from './dto';
import { RouteRepository } from './repository';
import { CarrierService } from '../carrier';
import { SelectRecordDto } from '../../shared';
import { CurrencyService, RoutingService } from '../../../integrations';
import { ApiTags } from '@nestjs/swagger';
import { CarrierStatus, RouteStatus } from '@prisma/client';
import UpdateRouteStatusBody = UpdateRouteStatusDto.UpdateRouteStatusBody;

@Injectable()
@ApiTags('Routes')
export class RouteService {
  private readonly context = 'route-service';

  constructor(
    private readonly logger: Logger,
    private readonly routeRepository: RouteRepository,
    private readonly carrierService: CarrierService,
    private readonly currencyService: CurrencyService,
    private readonly routingService: RoutingService,
  ) {}

  /**
   * Finds paginated routes
   * @param page
   * @param limit
   * @param status
   * @param minPrice
   * @param maxPrice
   */
  async getAll({
    page,
    limit,
    status,
    minPrice,
    maxPrice,
  }: GetRoutesRequestDto) {
    if (minPrice && maxPrice && maxPrice < minPrice) {
      this.logger.error(
        'Minimum price can not be greater than maximum price',
        null,
        this.context,
      );
      throw new BadRequestException(
        'Minimum price can not be greater than maximum price',
      );
    }

    return this.routeRepository.findManyAndCount({
      where: {
        ...(status && { status }),
        ...(minPrice && {
          price: {
            gte: minPrice,
          },
        }),
        ...(maxPrice && {
          price: {
            lte: maxPrice,
          },
        }),
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Returns route record with assigned carrier.
   * @param id
   */
  async getOne(id: string) {
    const route = await this.routeRepository.findOne({
      where: { id },
      include: { carrier: true },
    });
    if (!route) {
      this.logger.error(`Route with id: ${id} not found`, null, this.context);
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  /**
   * Creates the route record with basic info.
   * @param data
   */
  async create(data: CreateRouteRequestDto) {
    const {
      startPoint,
      endPoint,
      departureDate,
      completionDate,
      price,
      currency,
      ...rest
    } = data;
    if (departureDate > completionDate) {
      this.logger.error(
        'The departure date can not be greater than completionDate',
        null,
        this.context,
      );
      throw new BadRequestException(
        'The departure date can not be greater than completionDate',
      );
    }

    const distance = await this.routingService.getDistance({
      start: startPoint,
      end: endPoint,
    });
    const convertedPrice = await this.currencyService.convertToEUR(
      price,
      currency,
    );

    return this.routeRepository.create({
      startPoint: startPoint.toString(),
      endPoint: endPoint.toString(),
      departureDate,
      completionDate,
      distance,
      price: convertedPrice,
      ...rest,
    });
  }

  /**
   * Updates basic info on route if one is not in progress or completed.
   * @param routeId
   * @param data
   */
  async update(
    { id: routeId }: UpdateRouteRequestDto.UpdateRouteParam,
    data: UpdateRouteRequestDto.UpdateRouteBody,
  ) {
    const route = await this.getOne(routeId);
    if (!route) {
      this.logger.error(
        `Route with provided ID: ${routeId} has been not found.`,
        null,
        this.context,
      );
      throw new NotFoundException('Route with provided ID has been not found.');
    }

    if (
      route.status === RouteStatus.IN_PROGRESS ||
      route.status === RouteStatus.COMPLETED
    ) {
      this.logger.error(
        `Can not modify route which is in progress or completed`,
        null,
        this.context,
      );
      throw new BadRequestException(
        'Can not modify route which is in progress or completed',
      );
    }

    const {
      departureDate = route.departureDate,
      completionDate = route.completionDate,
      price,
      currency,
      requiredCarrierType,
    } = data;

    if (departureDate > completionDate) {
      this.logger.error(
        'Departure date can not be greater than completionDate',
        null,
        this.context,
      );
      throw new BadRequestException(
        'Departure date can not be greater than completionDate',
      );
    }

    const convertedPrice =
      price && currency
        ? await this.currencyService.convertToEUR(price, currency)
        : undefined;

    return this.routeRepository.update(
      { id: routeId },
      {
        departureDate,
        completionDate,
        requiredCarrierType,
        price: convertedPrice,
      },
    );
  }

  /**
   * Assigns carrier to a route and calculates carrier revenue.
   * @param routeId
   * @param carrierId
   */
  async setCarrier(routeId: string, carrierId: string) {
    const route = await this.getOne(routeId);

    let carrierFee: number;
    if (carrierId) {
      if (route.carrierId) {
        this.logger.error(
          'Carrier has been already assigned to this route',
          null,
          this.context,
        );
        throw new BadRequestException(
          'Carrier has been already assigned to this route',
        );
      }
      const carrier = await this.carrierService.getOne(carrierId);
      if (carrier.status !== CarrierStatus.AVAILABLE) {
        this.logger.error(
          `Carrier with id: ${carrierId} is not available`,
          null,
          this.context,
        );
        throw new BadRequestException('Carrier is not available');
      }
      if (carrier.type !== route.requiredCarrierType) {
        this.logger.error(
          `Carrier type is not compatible with this route`,
          null,
          this.context,
        );
        throw new BadRequestException(
          'Carrier type is not compatible with this route',
        );
      }

      carrierFee = (Number(route.distance) / 1000) * Number(carrier.rate);
    }

    return this.routeRepository.update(
      { id: routeId },
      {
        status: RouteStatus.IN_PROGRESS,
        carrierFee,
        carrier: {
          connect: { id: carrierId },
          update: { status: CarrierStatus.BUSY },
        },
      },
    );
  }

  /**
   * Updates the route status, actual departure and arrival time.
   * @param routeId
   * @param data
   */
  async updateStatus(routeId: string, data: UpdateRouteStatusBody) {
    const route = await this.getOne(routeId);
    if (route.status === RouteStatus.COMPLETED) {
      this.logger.error(
        `Route with id: ${routeId} has been completed`,
        null,
        this.context,
      );
      throw new BadRequestException('Route has been completed');
    }

    const { departureDateActual, completionDateActual, status } = data;

    if (departureDateActual > completionDateActual) {
      this.logger.error(
        'Departure date can not be greater than completionDate',
        null,
        this.context,
      );
      throw new BadRequestException(
        'Departure date can not be greater than completionDate',
      );
    }

    if (route.departureDateActual && departureDateActual) {
      this.logger.error(
        `Route with id: ${routeId} departure date is already set`,
        this.context,
      );
      throw new BadRequestException('Departure date is already set');
    }
    if (route.completionDateActual && completionDateActual) {
      this.logger.error(
        `Route with id: ${routeId} completion date is already set`,
        null,
        this.context,
      );
      throw new BadRequestException('Completion date is already set');
    }

    if (
      status === RouteStatus.COMPLETED &&
      ((!route.completionDateActual && !completionDateActual) ||
        (!route.departureDateActual && !departureDateActual))
    ) {
      this.logger.error(
        'The actual departure/completion date has to be set',
        null,
        this.context,
      );
      throw new BadRequestException(
        'The actual departure/completion date has to be set',
      );
    }

    return this.routeRepository.update(
      { id: routeId },
      {
        ...data,
        ...(status === RouteStatus.COMPLETED && {
          carrier: {
            update: {
              status: CarrierStatus.AVAILABLE,
            },
          },
        }),
      },
    );
  }

  /**
   * Deletes the route record by ID.
   * @param id
   */
  async delete({ id }: SelectRecordDto) {
    return this.routeRepository.delete({ id });
  }
}
