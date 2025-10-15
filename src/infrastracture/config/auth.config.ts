import { registerAs } from '@nestjs/config';
import { AUTH_CONFIG_NAME } from './constants';

export default registerAs(AUTH_CONFIG_NAME, () => ({
  apiKey: process.env.AUTH_API_KEY || 'secret',
}));
