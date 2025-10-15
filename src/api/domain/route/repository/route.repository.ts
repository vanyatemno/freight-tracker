import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../infrastracture';

@Injectable()
export class RouteRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async findOne(params: Prisma.RouteFindFirstArgs) {
    return this.prismaService.route.findFirst(params);
  }

  public async findManyAndCount(params: Prisma.RouteFindManyArgs) {
    const { where } = params;
    const [data, total] = await Promise.all([
      this.prismaService.route.findMany(params),
      this.prismaService.route.count({ where }),
    ]);

    return { data, total };
  }

  public async create(create: Prisma.RouteCreateInput) {
    return this.prismaService.route.create({ data: create });
  }

  public async delete(where: Prisma.RouteWhereUniqueInput) {
    return this.prismaService.route.delete({ where });
  }

  public async update(
    where: Prisma.RouteWhereUniqueInput,
    data: Prisma.RouteUpdateInput,
  ) {
    return this.prismaService.route.update({ where, data });
  }
}
