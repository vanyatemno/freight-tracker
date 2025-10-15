import {
  PrismaClient,
  CarrierType,
  CarrierStatus,
  RouteStatus,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Clean existing data
  await prisma.route.deleteMany();
  await prisma.carrier.deleteMany();

  // Create carriers with different types and statuses
  const carriers = await Promise.all([
    // MINI carrier - AVAILABLE
    prisma.carrier.create({
      data: {
        licensePlate: 'ABC123',
        model: 'Toyota Hiace',
        type: CarrierType.MINI,
        registrationDate: new Date('2020-01-15'),
        status: CarrierStatus.BUSY,
        rate: new Decimal('25.50'),
      },
    }),
    // BOX carrier - AVAILABLE
    prisma.carrier.create({
      data: {
        licensePlate: 'XYZ789',
        model: 'Mercedes Sprinter',
        type: CarrierType.BOX,
        registrationDate: new Date('2021-03-20'),
        status: CarrierStatus.AVAILABLE,
        rate: new Decimal('35.75'),
      },
    }),
    // FLAT carrier - BUSY
    prisma.carrier.create({
      data: {
        licensePlate: 'DEF456',
        model: 'Volvo FH16',
        type: CarrierType.FLAT,
        registrationDate: new Date('2019-11-05'),
        status: CarrierStatus.BUSY,
        rate: new Decimal('45.00'),
      },
    }),
    // REFRIGERATED carrier - AVAILABLE
    prisma.carrier.create({
      data: {
        licensePlate: 'GHI789',
        model: 'Scania R450',
        type: CarrierType.REFRIGERATED,
        registrationDate: new Date('2022-05-10'),
        status: CarrierStatus.AVAILABLE,
        rate: new Decimal('55.25'),
      },
    }),
    // TANKER carrier - BUSY
    prisma.carrier.create({
      data: {
        licensePlate: 'JKL012',
        model: 'MAN TGX',
        type: CarrierType.TANKER,
        registrationDate: new Date('2018-07-22'),
        status: CarrierStatus.AVAILABLE,
        rate: new Decimal('60.50'),
      },
    }),
    // Edge case: Very old registration date
    prisma.carrier.create({
      data: {
        licensePlate: 'OLD999',
        model: 'Vintage Truck',
        type: CarrierType.BOX,
        registrationDate: new Date('2000-01-01'),
        status: CarrierStatus.AVAILABLE,
        rate: new Decimal('20.00'),
      },
    }),
    // Edge case: Very high rate
    prisma.carrier.create({
      data: {
        licensePlate: 'EXP100',
        model: 'Premium Carrier',
        type: CarrierType.REFRIGERATED,
        registrationDate: new Date('2023-01-01'),
        status: CarrierStatus.AVAILABLE,
        rate: new Decimal('199.99'),
      },
    }),
  ]);

  console.log(`Created ${carriers.length} carriers`);

  // Get today's date for reference
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  // Create routes with different statuses and scenarios
  const routes = await Promise.all([
    // AWAITING_DISPATCH route - no carrier assigned yet
    prisma.route.create({
      data: {
        startPoint: 'Warsaw, Poland',
        endPoint: 'Berlin, Germany',
        distance: new Decimal('574.50'),
        departureDate: tomorrow,
        completionDate: nextWeek,
        requiredCarrierType: CarrierType.BOX,
        price: new Decimal('1200.00'),
        status: RouteStatus.AWAITING_DISPATCH,
      },
    }),
    // IN_PROGRESS route - with carrier assigned and actual departure date
    prisma.route.create({
      data: {
        startPoint: 'Paris, France',
        endPoint: 'Madrid, Spain',
        distance: new Decimal('1052.75'),
        departureDate: yesterday,
        completionDate: nextWeek,
        departureDateActual: yesterday,
        requiredCarrierType: CarrierType.FLAT,
        carrierFee: new Decimal('450.00'),
        price: new Decimal('2500.00'),
        status: RouteStatus.IN_PROGRESS,
        carrierId: carriers[2].id, // FLAT carrier that's BUSY
      },
    }),
    // COMPLETED route - with all dates filled
    prisma.route.create({
      data: {
        startPoint: 'Rome, Italy',
        endPoint: 'Vienna, Austria',
        distance: new Decimal('765.30'),
        departureDate: lastWeek,
        completionDate: yesterday,
        departureDateActual: lastWeek,
        completionDateActual: yesterday,
        requiredCarrierType: CarrierType.TANKER,
        carrierFee: new Decimal('600.00'),
        price: new Decimal('1800.00'),
        status: RouteStatus.COMPLETED,
        carrierId: carriers[4].id, // TANKER carrier that's BUSY
      },
    }),
    // Edge case: Very short distance route
    prisma.route.create({
      data: {
        startPoint: 'Amsterdam, Netherlands',
        endPoint: 'Rotterdam, Netherlands',
        distance: new Decimal('78.20'),
        departureDate: tomorrow,
        completionDate: tomorrow,
        requiredCarrierType: CarrierType.MINI,
        price: new Decimal('250.00'),
        status: RouteStatus.AWAITING_DISPATCH,
      },
    }),
    // Edge case: Very long distance route
    prisma.route.create({
      data: {
        startPoint: 'Lisbon, Portugal',
        endPoint: 'Moscow, Russia',
        distance: new Decimal('4352.10'),
        departureDate: nextWeek,
        completionDate: new Date(nextWeek.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks after departure
        requiredCarrierType: CarrierType.REFRIGERATED,
        price: new Decimal('8500.00'),
        status: RouteStatus.AWAITING_DISPATCH,
      },
    }),
    // Edge case: High value cargo (high price)
    prisma.route.create({
      data: {
        startPoint: 'Zurich, Switzerland',
        endPoint: 'London, UK',
        distance: new Decimal('1010.50'),
        departureDate: tomorrow,
        completionDate: nextWeek,
        requiredCarrierType: CarrierType.BOX,
        price: new Decimal('15000.00'),
        status: RouteStatus.AWAITING_DISPATCH,
      },
    }),
    // Edge case: Delayed route (actual departure later than planned)
    prisma.route.create({
      data: {
        startPoint: 'Brussels, Belgium',
        endPoint: 'Copenhagen, Denmark',
        distance: new Decimal('865.40'),
        departureDate: lastWeek,
        completionDate: yesterday,
        departureDateActual: new Date(
          lastWeek.getTime() + 2 * 24 * 60 * 60 * 1000,
        ), // 2 days after planned
        requiredCarrierType: CarrierType.MINI,
        carrierFee: new Decimal('320.00'),
        price: new Decimal('1450.00'),
        status: RouteStatus.IN_PROGRESS,
        carrierId: carriers[0].id, // MINI carrier
      },
    }),
    // Edge case: Completed early (actual completion earlier than planned)
    prisma.route.create({
      data: {
        startPoint: 'Stockholm, Sweden',
        endPoint: 'Helsinki, Finland',
        distance: new Decimal('396.80'),
        departureDate: lastWeek,
        completionDate: yesterday,
        departureDateActual: lastWeek,
        completionDateActual: new Date(
          yesterday.getTime() - 2 * 24 * 60 * 60 * 1000,
        ), // 2 days before planned
        requiredCarrierType: CarrierType.BOX,
        carrierFee: new Decimal('280.00'),
        price: new Decimal('950.00'),
        status: RouteStatus.COMPLETED,
        carrierId: carriers[1].id, // BOX carrier
      },
    }),
  ]);

  console.log(`Created ${routes.length} routes`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
