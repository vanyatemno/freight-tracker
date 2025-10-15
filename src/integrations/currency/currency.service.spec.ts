import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyService } from './currency.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { CurrencyCode } from '../../shared';
import { CURRENCY_INTEGRATION_CONFIG_NAME } from '../../infrastracture';

describe('CurrencyService', () => {
  let service: CurrencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrencyService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === CURRENCY_INTEGRATION_CONFIG_NAME) {
                return { apiKey: 'test-api-key' };
              }
              return null;
            }),
          },
        },
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CurrencyService>(CurrencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEURRate', () => {
    it('should return 1 if currency is EUR', async () => {
      const rate = await service.getEURRate(CurrencyCode.EUR);
      expect(rate).toEqual(1);
    });

    it('should fetch and return the currency rate', async () => {
      const mockResponse = {
        success: true,
        timestamp: 1622548800,
        base: 'EUR',
        date: '2021-06-01',
        rates: {
          USD: 1.22,
        },
      };
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const rate = await service.getEURRate(CurrencyCode.USD);
      expect(rate).toEqual(1.22);
    });

    it('should call the correct URL', async () => {
      const mockResponse = {
        success: true,
        timestamp: 1622548800,
        base: 'EUR',
        date: '2021-06-01',
        rates: {
          USD: 1.22,
        },
      };
      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      await service.getEURRate(CurrencyCode.USD);
      const expectedUrl = new URL('https://data.fixer.io/api/latest');
      expectedUrl.searchParams.append('access_key', 'test-api-key');
      expectedUrl.searchParams.append('symbols', CurrencyCode.USD);
      expectedUrl.searchParams.append('base', CurrencyCode.EUR);

      expect(global.fetch).toHaveBeenCalledWith(expectedUrl);
    });

    it('should throw an error if fetch fails', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));
      await expect(service.getEURRate(CurrencyCode.USD)).rejects.toThrow(
        'could not fetch currency rate',
      );
    });
  });

  describe('convertToEUR', () => {
    it('should convert the amount to EUR', async () => {
      jest.spyOn(service, 'getEURRate').mockResolvedValue(1.22);
      const amount = await service.convertToEUR(100, CurrencyCode.USD);
      expect(amount).toBeCloseTo(81.967);
    });
  });
});
