import { RouteRepository } from './route.repository';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../../infrastracture';

@Module({
  imports: [PrismaModule],
  providers: [RouteRepository],
  exports: [RouteRepository],
})
export class RouteRepositoryModule {}
