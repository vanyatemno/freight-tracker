import { registerAs } from '@nestjs/config';
import { CURRENCY_INTEGRATION_CONFIG_NAME } from './constants';

export default registerAs(CURRENCY_INTEGRATION_CONFIG_NAME, () => ({
  apiKey: process.env.CURRENCY_INTEGRATION_API_KEY || '',
}));
