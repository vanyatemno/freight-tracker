import { Test, TestingModule } from '@nestjs/testing';
import { CarrierService } from './carrier.service';
import { CarrierRepository } from './repository';
import { CurrencyService } from '../../../integrations';
import {
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CarrierStatus, CarrierType, Prisma } from '@prisma/client';
import { CurrencyCode } from '../../../shared';

describe('CarrierService', () => {
  let service: CarrierService;
  let repository: CarrierRepository;
  let currencyService: CurrencyService;

  const mockCarrierRepository = {
    findManyAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockCurrencyService = {
    convertToEUR: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarrierService,
        {
          provide: CarrierRepository,
          useValue: mockCarrierRepository,
        },
        {
          provide: CurrencyService,
          useValue: mockCurrencyService,
        },
      ],
    }).compile();

    service = module.get<CarrierService>(CarrierService);
    repository = module.get<CarrierRepository>(CarrierRepository);
    currencyService = module.get<CurrencyService>(CurrencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return paginated carriers', async () => {
      const result = { data: [], count: 0 };
      mockCarrierRepository.findManyAndCount.mockResolvedValue(result);
      expect(await service.getAll({ page: 1, limit: 10 })).toBe(result);
    });
  });

  describe('getOne', () => {
    it('should return a carrier', async () => {
      const carrier = { id: '1' };
      mockCarrierRepository.findOne.mockResolvedValue(carrier);
      expect(await service.getOne('1')).toBe(carrier);
    });
  });

  describe('create', () => {
    it('should create a carrier', async () => {
      const createDto = {
        model: 'Test Model',
        licensePlate: 'TEST1234',
        rate: 100,
        currency: CurrencyCode.USD,
        status: CarrierStatus.AVAILABLE,
        type: CarrierType.BOX,
        registrationDate: new Date().toISOString(),
      };
      const convertedRate = 90;
      mockCurrencyService.convertToEUR.mockResolvedValue(convertedRate);
      mockCarrierRepository.create.mockResolvedValue({
        ...createDto,
        rate: convertedRate,
      });

      const result = await service.create(createDto);
      expect(currencyService.convertToEUR).toHaveBeenCalledWith(
        createDto.rate,
        createDto.currency,
      );
      expect(repository.create).toHaveBeenCalledWith({
        model: createDto.model,
        licensePlate: createDto.licensePlate,
        status: createDto.status,
        rate: convertedRate,
        type: createDto.type,
        registrationDate: createDto.registrationDate,
      });
      expect(result).toEqual({ ...createDto, rate: convertedRate });
    });

    it('should throw BadRequestException on duplicate license plate', async () => {
      const createDto = {
        model: 'Test Model',
        licensePlate: 'TEST1234',
        rate: 100,
        currency: CurrencyCode.USD,
        status: CarrierStatus.AVAILABLE,
        type: CarrierType.BOX,
        registrationDate: new Date().toISOString(),
      };
      mockCurrencyService.convertToEUR.mockResolvedValue(90);
      mockCarrierRepository.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Error', {
          code: 'P2002',
          clientVersion: '2.20.0',
        }),
      );

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    const carrierId = { id: '1' };
    const updateDto = {
      rate: 120,
      currency: CurrencyCode.USD,
      status: CarrierStatus.AVAILABLE,
    };

    it('should update a carrier', async () => {
      const existingCarrier = { id: '1', status: CarrierStatus.AVAILABLE };
      const convertedRate = 110;
      mockCarrierRepository.findOne.mockResolvedValue(existingCarrier);
      mockCurrencyService.convertToEUR.mockResolvedValue(convertedRate);
      mockCarrierRepository.update.mockResolvedValue({
        ...existingCarrier,
        ...updateDto,
        rate: convertedRate,
      });

      const result = await service.update(carrierId, updateDto);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: carrierId.id },
      });
      expect(currencyService.convertToEUR).toHaveBeenCalledWith(
        updateDto.rate,
        updateDto.currency,
      );
      expect(repository.update).toHaveBeenCalledWith(
        { id: carrierId.id },
        {
          rate: convertedRate,
          status: updateDto.status,
        },
      );
      expect(result).toEqual({
        ...existingCarrier,
        ...updateDto,
        rate: convertedRate,
      });
    });

    it('should throw NotFoundException if carrier not found', async () => {
      mockCarrierRepository.findOne.mockResolvedValue(null);
      await expect(service.update(carrierId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if updating a BUSY carrier to a status other than AVAILABLE', async () => {
      const existingCarrier = { id: '1', status: CarrierStatus.BUSY };
      mockCarrierRepository.findOne.mockResolvedValue(existingCarrier);
      await expect(
        service.update(carrierId, { ...updateDto, status: CarrierStatus.BUSY }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnprocessableEntityException if rate is updated without currency', async () => {
      const existingCarrier = { id: '1', status: CarrierStatus.AVAILABLE };
      mockCarrierRepository.findOne.mockResolvedValue(existingCarrier);
      await expect(service.update(carrierId, { rate: 120 })).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a carrier', async () => {
      const carrierId = { id: '1' };
      mockCarrierRepository.delete.mockResolvedValue({ id: '1' });
      await service.delete(carrierId);
      expect(repository.delete).toHaveBeenCalledWith({ id: carrierId.id });
    });
  });
});
