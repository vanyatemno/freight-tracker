-- CreateEnum
CREATE TYPE "CarrierType" AS ENUM ('MINI', 'BOX', 'FLAT', 'REFRIGERATED', 'TANKER');

-- CreateEnum
CREATE TYPE "CarrierStatus" AS ENUM ('AVAILABLE', 'BUSY');

-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('AWAITING_DISPATCH', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "carriers" (
    "id" TEXT NOT NULL,
    "license_plate" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "type" "CarrierType" NOT NULL,
    "registration_date" TIMESTAMP(3) NOT NULL,
    "status" "CarrierStatus" NOT NULL DEFAULT 'AVAILABLE',
    "rate" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carriers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "start_point" TEXT NOT NULL,
    "end_point" TEXT NOT NULL,
    "distance" DECIMAL(10,2) NOT NULL,
    "required_carrier_type" "CarrierType" NOT NULL,
    "status" "RouteStatus" NOT NULL DEFAULT 'AWAITING_DISPATCH',
    "price" DECIMAL(10,2) NOT NULL,
    "carrier_fee" DECIMAL(10,2),
    "departure_date" TIMESTAMP(3) NOT NULL,
    "completion_date" TIMESTAMP(3) NOT NULL,
    "departure_date_actual" TIMESTAMP(3),
    "completion_date_actual" TIMESTAMP(3),
    "carrier_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "carriers_license_plate_key" ON "carriers"("license_plate");

-- CreateIndex
CREATE INDEX "carriers_status_idx" ON "carriers"("status");

-- CreateIndex
CREATE INDEX "carriers_type_idx" ON "carriers"("type");

-- CreateIndex
CREATE INDEX "routes_status_idx" ON "routes"("status");

-- CreateIndex
CREATE INDEX "routes_departure_date_idx" ON "routes"("departure_date");

-- CreateIndex
CREATE INDEX "routes_carrier_id_idx" ON "routes"("carrier_id");

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carriers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
