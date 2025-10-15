import { Logger, Module } from '@nestjs/common';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';
import { PrismaModule } from '../../../infrastracture';
import { CarrierModule } from '../carrier';
import { CurrencyModule, RoutingModule } from '../../../integrations';
import { RouteRepositoryModule } from './repository';

@Module({
  imports: [
    PrismaModule,
    CarrierModule,
    CurrencyModule,
    RoutingModule,
    RouteRepositoryModule,
  ],
  controllers: [RouteController],
  providers: [Logger, RouteService],
  exports: [RouteService],
})
export class RouteModule {}
