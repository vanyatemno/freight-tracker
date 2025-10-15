import { Test, TestingModule } from '@nestjs/testing';
import { RoutingService } from './routing.service';
import { Logger } from '@nestjs/common';
import { RouteEndpoints } from './types';

describe('RoutingService', () => {
  let service: RoutingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutingService,
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoutingService>(RoutingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDistance', () => {
    it('should fetch and return the distance', async () => {
      const mockResponse = {
        code: 'Ok',
        routes: [
          {
            distance: 1000,
            duration: 100,
            geometry: '',
            weight: 100,
            weight_name: 'routability',
            legs: [],
          },
        ],
        waypoints: [],
      };
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const route: RouteEndpoints = {
        start: { lat: 52.52, long: 13.405 },
        end: { lat: 48.8566, long: 2.3522 },
      };
      const distance = await service.getDistance(route);
      expect(distance).toEqual(1000);
    });

    it('should call the correct URL', async () => {
      const mockResponse = {
        code: 'Ok',
        routes: [
          {
            distance: 1000,
            duration: 100,
            geometry: '',
            weight: 100,
            weight_name: 'routability',
            legs: [],
          },
        ],
        waypoints: [],
      };
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const route: RouteEndpoints = {
        start: { lat: 52.52, long: 13.405 },
        end: { lat: 48.8566, long: 2.3522 },
      };
      await service.getDistance(route);
      const expectedUrl = new URL(
        'https://router.project-osrm.org/route/v1/driving/52.52,13.405;48.8566,2.3522',
      );
      expectedUrl.searchParams.append('steps', 'false');
      expectedUrl.searchParams.append('overview', 'false');

      expect(global.fetch).toHaveBeenCalledWith(expectedUrl, { method: 'GET' });
    });

    it('should throw an error if no routes are found', async () => {
      const mockResponse = {
        code: 'Ok',
        routes: [],
        waypoints: [],
      };
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const route: RouteEndpoints = {
        start: { lat: 0, long: 0 },
        end: { lat: 0, long: 0 },
      };
      await expect(service.getDistance(route)).rejects.toThrow(
        'Can not find route for this two points',
      );
    });

    it('should throw an error if fetch fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));
      const route: RouteEndpoints = {
        start: { lat: 52.52, long: 13.405 },
        end: { lat: 48.8566, long: 2.3522 },
      };
      await expect(service.getDistance(route)).rejects.toThrow();
    });
  });
});
