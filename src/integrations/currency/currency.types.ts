import { IsBoolean, IsEnum, IsNumber, IsObject, Min } from 'class-validator';
import { CurrencyCode } from '../../shared';

export class CurrencyAPIResponse {
  @IsBoolean()
  success: boolean;

  @IsNumber()
  @Min(0)
  timestamp: number;

  @IsEnum(CurrencyCode)
  base: CurrencyCode;

  @IsObject()
  rates: Record<CurrencyCode, number>;
}
