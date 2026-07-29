-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "crm"."ProjectDocumentType" ADD VALUE 'TRT';
ALTER TYPE "crm"."ProjectDocumentType" ADD VALUE 'PROJETO_AUTOCAD';
ALTER TYPE "crm"."ProjectDocumentType" ADD VALUE 'PROJETO_DXF';
ALTER TYPE "crm"."ProjectDocumentType" ADD VALUE 'PROJETO_EXECUTIVO';
ALTER TYPE "crm"."ProjectDocumentType" ADD VALUE 'PROJETO_APROVADO';
ALTER TYPE "crm"."ProjectDocumentType" ADD VALUE 'AS_BUILT';
ALTER TYPE "crm"."ProjectDocumentType" ADD VALUE 'LISTA_MATERIAIS';
ALTER TYPE "crm"."ProjectDocumentType" ADD VALUE 'DIAGRAMA';
ALTER TYPE "crm"."ProjectDocumentType" ADD VALUE 'DRONE';

-- CreateTable
CREATE TABLE "crm"."ProjectTechnicalSpecification" (
    "id" TEXT NOT NULL,
    "systemType" TEXT,
    "installedPower" DOUBLE PRECISION,
    "connectionPower" DOUBLE PRECISION,
    "generationTarget" DOUBLE PRECISION,
    "distributor" TEXT,
    "consumerUnit" TEXT,
    "tariffGroup" TEXT,
    "consumerClass" TEXT,
    "contractedDemand" DOUBLE PRECISION,
    "measuredDemand" DOUBLE PRECISION,
    "voltage" TEXT,
    "phase" TEXT,
    "connectionStandard" TEXT,
    "installationAddress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "roofType" TEXT,
    "roofArea" DOUBLE PRECISION,
    "roofOrientation" TEXT,
    "roofSlope" DOUBLE PRECISION,
    "shading" TEXT,
    "structureType" TEXT,
    "technicalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectTechnicalSpecification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."EngineeringEquipment" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "manufacturer" TEXT,
    "model" TEXT,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "power" DOUBLE PRECISION,
    "unit" TEXT,
    "voltage" DOUBLE PRECISION,
    "current" DOUBLE PRECISION,
    "mppt" INTEGER,
    "efficiency" DOUBLE PRECISION,
    "dimensions" TEXT,
    "weight" DOUBLE PRECISION,
    "technicalData" JSONB,
    "notes" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "EngineeringEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."EngineeringMaterial" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "manufacturer" TEXT,
    "model" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "specification" TEXT,
    "notes" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "EngineeringMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."EngineeringCoordinate" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "elevation" DOUBLE PRECISION,
    "reference" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "EngineeringCoordinate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."EngineeringString" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mppt" TEXT,
    "moduleQuantity" INTEGER NOT NULL,
    "orientation" TEXT,
    "tilt" DOUBLE PRECISION,
    "azimuth" DOUBLE PRECISION,
    "notes" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "equipmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "EngineeringString_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTechnicalSpecification_projectId_key" ON "crm"."ProjectTechnicalSpecification"("projectId");

-- CreateIndex
CREATE INDEX "ProjectTechnicalSpecification_projectId_idx" ON "crm"."ProjectTechnicalSpecification"("projectId");

-- CreateIndex
CREATE INDEX "EngineeringEquipment_projectId_idx" ON "crm"."EngineeringEquipment"("projectId");

-- CreateIndex
CREATE INDEX "EngineeringEquipment_projectId_type_idx" ON "crm"."EngineeringEquipment"("projectId", "type");

-- CreateIndex
CREATE INDEX "EngineeringEquipment_projectId_position_idx" ON "crm"."EngineeringEquipment"("projectId", "position");

-- CreateIndex
CREATE INDEX "EngineeringMaterial_projectId_idx" ON "crm"."EngineeringMaterial"("projectId");

-- CreateIndex
CREATE INDEX "EngineeringMaterial_projectId_category_idx" ON "crm"."EngineeringMaterial"("projectId", "category");

-- CreateIndex
CREATE INDEX "EngineeringMaterial_projectId_position_idx" ON "crm"."EngineeringMaterial"("projectId", "position");

-- CreateIndex
CREATE INDEX "EngineeringCoordinate_projectId_idx" ON "crm"."EngineeringCoordinate"("projectId");

-- CreateIndex
CREATE INDEX "EngineeringCoordinate_projectId_type_idx" ON "crm"."EngineeringCoordinate"("projectId", "type");

-- CreateIndex
CREATE INDEX "EngineeringCoordinate_projectId_position_idx" ON "crm"."EngineeringCoordinate"("projectId", "position");

-- CreateIndex
CREATE INDEX "EngineeringString_projectId_idx" ON "crm"."EngineeringString"("projectId");

-- CreateIndex
CREATE INDEX "EngineeringString_projectId_position_idx" ON "crm"."EngineeringString"("projectId", "position");

-- CreateIndex
CREATE INDEX "EngineeringString_equipmentId_idx" ON "crm"."EngineeringString"("equipmentId");

-- AddForeignKey
ALTER TABLE "crm"."ProjectTechnicalSpecification" ADD CONSTRAINT "ProjectTechnicalSpecification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "crm"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."EngineeringEquipment" ADD CONSTRAINT "EngineeringEquipment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "crm"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."EngineeringMaterial" ADD CONSTRAINT "EngineeringMaterial_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "crm"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."EngineeringCoordinate" ADD CONSTRAINT "EngineeringCoordinate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "crm"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."EngineeringString" ADD CONSTRAINT "EngineeringString_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "crm"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
