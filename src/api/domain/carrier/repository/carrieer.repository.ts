import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../infrastracture';

@Injectable()
export class CarrierRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async findOne(params: Prisma.CarrierFindFirstArgs) {
    return this.prismaService.carrier.findFirst(params);
  }

  public async findManyAndCount(params: Prisma.CarrierFindManyArgs) {
    const { where } = params;

    const [data, total] = await Promise.all([
      this.prismaService.carrier.findMany(params),
      this.prismaService.carrier.count({ where }),
    ]);

    return { data, total };
  }

  public async create(create: Prisma.CarrierCreateInput) {
    return this.prismaService.carrier.create({ data: create });
  }

  public async delete(where: Prisma.CarrierWhereUniqueInput) {
    return this.prismaService.carrier.delete({ where });
  }

  public async update(
    where: Prisma.CarrierWhereUniqueInput,
    data: Prisma.CarrierUpdateInput,
  ) {
    return this.prismaService.carrier.update({ where, data });
  }
}
