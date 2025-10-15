import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CurrencyAPIResponse } from './currency.types';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { CURRENCY_INTEGRATION_CONFIG_NAME } from '../../infrastracture';
import { CurrencyCode } from '../../shared';

@Injectable()
export class CurrencyService {
  private readonly baseUrl = 'https://data.fixer.io/api/';
  private readonly apiKey: string;

  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    const { apiKey } = this.configService.get(CURRENCY_INTEGRATION_CONFIG_NAME);
    this.apiKey = apiKey;
  }

  /**
   * Fetches the USD rate for specified currency.
   * @param code
   */
  public async getEURRate(code: CurrencyCode) {
    try {
      if (code === CurrencyCode.EUR) {
        return 1;
      }
      const url = this.buildCurrencyRateURL(code);

      const response = await fetch(url);
      const data = await response.json();

      const apiResponse = plainToInstance(CurrencyAPIResponse, data);
      await validateOrReject(apiResponse);

      return apiResponse.rates[code];
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('could not fetch currency rate');
    }
  }

  /**
   * Converts provided amount to EUR.
   * @param amount
   * @param code
   */
  public async convertToEUR(amount: number, code: CurrencyCode) {
    const rate = await this.getEURRate(code);
    return amount / rate;
  }

  /**
   * Builds a URL to external service to get exchange rate for specified
   * currency.
   * @param code
   * @private
   */
  private buildCurrencyRateURL(code: CurrencyCode) {
    const url = new URL(this.baseUrl + 'latest');
    url.searchParams.append('access_key', this.apiKey);
    url.searchParams.append('symbols', code);
    url.searchParams.append('base', CurrencyCode.EUR);

    return url;
  }
}
