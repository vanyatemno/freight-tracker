import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './infrastracture/config/app.config';
import authConfig from './infrastracture/config/auth.config';
import currencyIntegrationConfig from './infrastracture/config/currency-integration.config';
import { AuthMiddleware } from './middleware';
import { CarrierModule, RouteModule } from './api';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, currencyIntegrationConfig],
    }),
    CarrierModule,
    RouteModule,
  ],
  providers: [Logger],
})
export class AppModule implements NestModule {
  async configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
