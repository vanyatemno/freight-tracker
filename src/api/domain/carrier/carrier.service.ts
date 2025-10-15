import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CarrierRepository } from './repository';
import {
  CreateCarrierRequestDto,
  GetCarriersRequestDto,
  UpdateCarrierRequestDto,
} from './dto';
import { SelectRecordDto } from '../../shared';
import { CurrencyService } from '../../../integrations';
import { CarrierStatus, Prisma } from '@prisma/client';

@Injectable()
export class CarrierService {
  constructor(
    private readonly carrierRepository: CarrierRepository,
    private readonly currencyService: CurrencyService,
  ) {}

  /**
   * Returns paginated carriers with applied filters.
   * @param search
   * @param status
   * @param page
   * @param limit
   */
  async getAll({ search, status, page, limit }: GetCarriersRequestDto) {
    return this.carrierRepository.findManyAndCount({
      where: {
        ...(status && { status }),
        ...(search && {
          OR: [
            {
              model: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              licensePlate: search,
            },
          ],
        }),
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  /**
   * Finds a carrier by ID.
   * @param id
   */
  async getOne(id: string) {
    return this.carrierRepository.findOne({ where: { id } });
  }

  async create(body: CreateCarrierRequestDto) {
    const { currency, rate, ...rest } = body;
    const convertedRate = await this.currencyService.convertToEUR(
      rate,
      currency,
    );

    try {
      return await this.carrierRepository.create({
        rate: convertedRate,
        ...rest,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'A carrier with specified plate already exists',
        );
      }

      throw error;
    }
  }

  /**
   * Updates carrier info if one is not fulfilling order.
   * @param carrierId
   * @param data
   */
  async update(
    { id: carrierId }: SelectRecordDto,
    data: UpdateCarrierRequestDto.UpdateCarrierBody,
  ) {
    const { currency, rate, status, ...rest } = data;
    const carrier = await this.getOne(carrierId);
    if (!carrier) {
      throw new NotFoundException(
        'Carrier with specified ID has been not found',
      );
    }
    if (
      carrier.status === CarrierStatus.BUSY &&
      status !== CarrierStatus.AVAILABLE
    ) {
      throw new BadRequestException(
        'Can not edit carrier while fulfilling order',
      );
    }

    let convertedRate: number;
    if (rate) {
      if (!currency) {
        throw new UnprocessableEntityException(
          'Currency has to be defined in order to update rate',
        );
      }
      convertedRate = await this.currencyService.convertToEUR(rate, currency);
    }

    try {
      return this.carrierRepository.update(
        { id: carrierId },
        {
          rate: convertedRate ?? rate,
          status,
          ...rest,
        },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'A carrier with specified plate already exists',
        );
      }

      throw error;
    }
  }

  /**
   * Deletes carrier record by its ID.
   * @param id
   */
  async delete({ id }: SelectRecordDto) {
    return this.carrierRepository.delete({ id });
  }
}
