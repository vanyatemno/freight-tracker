import { registerAs } from '@nestjs/config';
import { APP_CONFIG_NAME } from './constants';

export default registerAs(APP_CONFIG_NAME, () => ({
  port: +(process.env.PORT || 3000),
}));
