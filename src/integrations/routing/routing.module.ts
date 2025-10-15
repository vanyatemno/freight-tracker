import { RoutingService } from './routing.service';
import { Logger, Module } from '@nestjs/common';

@Module({
  providers: [Logger, RoutingService],
  exports: [RoutingService],
})
export class RoutingModule {}
