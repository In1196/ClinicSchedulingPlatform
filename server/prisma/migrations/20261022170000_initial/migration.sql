-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MANAGER', 'FRONT_DESK', 'PROVIDER');

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('PHYSICIAN', 'NURSE_PRACTITIONER', 'PHYSICIAN_ASSISTANT');

-- CreateEnum
CREATE TYPE "AvailabilityKind" AS ENUM ('WEEKLY', 'DATE_SPECIFIC');

-- CreateEnum
CREATE TYPE "AppointmentSetting" AS ENUM ('SCHEDULED', 'URGENT_CARE');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('EXTENDED', 'STANDARD');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('BOOKED', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "providerId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" UUID NOT NULL,
    "displayName" TEXT NOT NULL,
    "providerType" "ProviderType" NOT NULL,
    "credential" TEXT NOT NULL,
    "canDoExtendedVisits" BOOLEAN NOT NULL DEFAULT false,
    "pediatricEligible" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" UUID NOT NULL,
    "displayName" TEXT NOT NULL,
    "isPediatric" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coverage" (
    "id" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "startsOn" DATE NOT NULL,
    "endsOn" DATE NOT NULL,
    "coveredVisits" INTEGER NOT NULL,
    "reservedVisits" INTEGER NOT NULL DEFAULT 0,
    "usedVisits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityWindow" (
    "id" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "kind" "AvailabilityKind" NOT NULL,
    "dayOfWeek" INTEGER,
    "localDate" DATE,
    "startMinuteOfDay" INTEGER NOT NULL,
    "endMinuteOfDay" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailabilityWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "coverageId" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "setting" "AppointmentSetting" NOT NULL,
    "type" "AppointmentType" NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'BOOKED',
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "bufferMinutes" INTEGER NOT NULL DEFAULT 0,
    "createdById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_providerId_key" ON "User"("providerId");

-- CreateIndex
CREATE INDEX "Provider_providerType_isActive_idx" ON "Provider"("providerType", "isActive");

-- CreateIndex
CREATE INDEX "Coverage_patientId_endsOn_idx" ON "Coverage"("patientId", "endsOn");

-- CreateIndex
CREATE UNIQUE INDEX "Coverage_id_patientId_key" ON "Coverage"("id", "patientId");

-- CreateIndex
CREATE INDEX "AvailabilityWindow_providerId_dayOfWeek_idx" ON "AvailabilityWindow"("providerId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "AvailabilityWindow_providerId_localDate_idx" ON "AvailabilityWindow"("providerId", "localDate");

-- CreateIndex
CREATE INDEX "Appointment_startsAt_setting_idx" ON "Appointment"("startsAt", "setting");

-- CreateIndex
CREATE INDEX "Appointment_providerId_startsAt_idx" ON "Appointment"("providerId", "startsAt");

-- CreateIndex
CREATE INDEX "Appointment_patientId_startsAt_idx" ON "Appointment"("patientId", "startsAt");

-- CreateIndex
CREATE INDEX "AuditEvent_entityType_entityId_createdAt_idx" ON "AuditEvent"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_actorId_createdAt_idx" ON "AuditEvent"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coverage" ADD CONSTRAINT "Coverage_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityWindow" ADD CONSTRAINT "AvailabilityWindow_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_coverageId_patientId_fkey" FOREIGN KEY ("coverageId", "patientId") REFERENCES "Coverage"("id", "patientId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- These constraints preserve the scheduling rules even if multiple requests
-- attempt to book the same provider at the same time.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "User"
ADD CONSTRAINT "User_provider_role_consistency_check"
CHECK (("role" = 'PROVIDER' AND "providerId" IS NOT NULL) OR ("role" <> 'PROVIDER' AND "providerId" IS NULL));

ALTER TABLE "Coverage"
ADD CONSTRAINT "Coverage_visit_counts_check"
CHECK (
    "startsOn" <= "endsOn"
    AND "coveredVisits" >= 0
    AND "reservedVisits" >= 0
    AND "usedVisits" >= 0
    AND "reservedVisits" + "usedVisits" <= "coveredVisits"
);

ALTER TABLE "AvailabilityWindow"
ADD CONSTRAINT "AvailabilityWindow_time_range_check"
CHECK (
    "startMinuteOfDay" >= 0
    AND "endMinuteOfDay" <= 1440
    AND "startMinuteOfDay" < "endMinuteOfDay"
);

ALTER TABLE "AvailabilityWindow"
ADD CONSTRAINT "AvailabilityWindow_kind_fields_check"
CHECK (
    ("kind" = 'WEEKLY' AND "dayOfWeek" IS NOT NULL AND "dayOfWeek" BETWEEN 0 AND 6 AND "localDate" IS NULL)
    OR ("kind" = 'DATE_SPECIFIC' AND "dayOfWeek" IS NULL AND "localDate" IS NOT NULL)
);

ALTER TABLE "Appointment"
ADD CONSTRAINT "Appointment_duration_and_buffer_check"
CHECK (
    "startsAt" < "endsAt"
    AND (
        ("type" = 'EXTENDED' AND "endsAt" - "startsAt" = INTERVAL '40 minutes' AND "bufferMinutes" = 10)
        OR ("type" = 'STANDARD' AND "endsAt" - "startsAt" = INTERVAL '20 minutes' AND "bufferMinutes" = 0)
    )
);

ALTER TABLE "Appointment"
ADD CONSTRAINT "Appointment_provider_no_overlap"
EXCLUDE USING GIST (
    "providerId" WITH =,
    tsrange(
        "startsAt" AT TIME ZONE 'UTC',
        ("endsAt" AT TIME ZONE 'UTC') + ("bufferMinutes" * INTERVAL '1 minute'),
        '[)'
    ) WITH &&
)
WHERE ("status" <> 'CANCELLED');
