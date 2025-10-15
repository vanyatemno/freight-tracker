import { Test, TestingModule } from '@nestjs/testing';
import { RouteService } from './route.service';
import { RouteRepository } from './repository';
import { CarrierService } from '../carrier';
import { CurrencyService, RoutingService } from '../../../integrations';
import { Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { CarrierStatus, CarrierType, RouteStatus } from '@prisma/client';
import { CurrencyCode } from '../../../shared';

describe('RouteService', () => {
  let service: RouteService;
  let _repository: RouteRepository;
  let _carrierService: CarrierService;
  let _currencyService: CurrencyService;
  let _routingService: RoutingService;

  const mockRouteRepository = {
    findManyAndCount: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockCarrierService = {
    getOne: jest.fn(),
  };

  const mockCurrencyService = {
    convertToEUR: jest.fn(),
  };

  const mockRoutingService = {
    getDistance: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteService,
        Logger,
        { provide: RouteRepository, useValue: mockRouteRepository },
        { provide: CarrierService, useValue: mockCarrierService },
        { provide: CurrencyService, useValue: mockCurrencyService },
        { provide: RoutingService, useValue: mockRoutingService },
      ],
    }).compile();

    service = module.get<RouteService>(RouteService);
    _repository = module.get<RouteRepository>(RouteRepository);
    _carrierService = module.get<CarrierService>(CarrierService);
    _currencyService = module.get<CurrencyService>(CurrencyService);
    _routingService = module.get<RoutingService>(RoutingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should throw BadRequestException if minPrice > maxPrice', async () => {
      await expect(
        service.getAll({ page: 1, limit: 10, minPrice: 100, maxPrice: 50 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if departureDate > completionDate', async () => {
      const createDto = {
        startPoint: 'A',
        endPoint: 'B',
        departureDate: new Date('2025-01-02').toISOString(),
        completionDate: new Date('2025-01-01').toISOString(),
        price: 100,
        currency: CurrencyCode.USD,
        requiredCarrierType: CarrierType.BOX,
      };
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    const routeId = { id: '1' };
    const updateDto = {
      departureDate: new Date('2025-01-01').toISOString(),
      completionDate: new Date('2025-01-02').toISOString(),
    };

    it('should throw NotFoundException if route not found', async () => {
      mockRouteRepository.findOne.mockResolvedValue(null);
      await expect(service.update(routeId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if route is IN_PROGRESS', async () => {
      mockRouteRepository.findOne.mockResolvedValue({
        id: '1',
        status: RouteStatus.IN_PROGRESS,
      });
      await expect(service.update(routeId, updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('setCarrier', () => {
    const routeId = '1';
    const carrierId = '1';

    it('should throw BadRequestException if carrier already assigned', async () => {
      mockRouteRepository.findOne.mockResolvedValue({
        id: routeId,
        carrierId: '2',
      });
      await expect(service.setCarrier(routeId, carrierId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if carrier is not available', async () => {
      mockRouteRepository.findOne.mockResolvedValue({
        id: routeId,
        requiredCarrierType: CarrierType.BOX,
      });
      mockCarrierService.getOne.mockResolvedValue({
        id: carrierId,
        status: CarrierStatus.BUSY,
      });
      await expect(service.setCarrier(routeId, carrierId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if carrier type is not compatible', async () => {
      mockRouteRepository.findOne.mockResolvedValue({
        id: routeId,
        requiredCarrierType: CarrierType.BOX,
      });
      mockCarrierService.getOne.mockResolvedValue({
        id: carrierId,
        status: CarrierStatus.AVAILABLE,
        type: CarrierType.MINI,
      });
      await expect(service.setCarrier(routeId, carrierId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateStatus', () => {
    const routeId = '1';
    const updateStatusDto = {
      status: RouteStatus.COMPLETED,
      departureDateActual: new Date(),
      completionDateActual: new Date(),
    };

    it('should throw BadRequestException if route is already completed', async () => {
      mockRouteRepository.findOne.mockResolvedValue({
        id: routeId,
        status: RouteStatus.COMPLETED,
      });
      await expect(
        service.updateStatus(routeId, updateStatusDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if trying to set completion without departure', async () => {
      mockRouteRepository.findOne.mockResolvedValue({
        id: routeId,
        status: RouteStatus.IN_PROGRESS,
      });
      await expect(
        service.updateStatus(routeId, {
          status: RouteStatus.COMPLETED,
          completionDateActual: new Date(),
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
