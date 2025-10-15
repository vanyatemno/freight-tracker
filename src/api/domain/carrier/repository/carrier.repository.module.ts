import { Module } from '@nestjs/common';
import { CarrierRepository } from './carrieer.repository';
import { PrismaModule } from '../../../../infrastracture';

@Module({
  imports: [PrismaModule],
  providers: [CarrierRepository],
  exports: [CarrierRepository],
})
export class CarrierRepositoryModule {}
