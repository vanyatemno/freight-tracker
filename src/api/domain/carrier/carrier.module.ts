import { Module } from '@nestjs/common';
import { CarrierController } from './carrier.controller';
import { CarrierService } from './carrier.service';
import { CarrierRepositoryModule } from './repository';
import { CurrencyModule } from '../../../integrations';

@Module({
  imports: [CarrierRepositoryModule, CurrencyModule],
  controllers: [CarrierController],
  providers: [CarrierService],
  exports: [CarrierService],
})
export class CarrierModule {}
