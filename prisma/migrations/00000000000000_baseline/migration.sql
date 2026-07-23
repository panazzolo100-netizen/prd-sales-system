-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "crm";

-- CreateEnum
CREATE TYPE "crm"."UserRole" AS ENUM ('ADMIN', 'COMERCIAL', 'ENGENHARIA', 'FINANCEIRO');

-- CreateEnum
CREATE TYPE "crm"."LeadStatus" AS ENUM ('NOVO', 'CONTATO', 'VISITA', 'PROPOSTA', 'NEGOCIACAO', 'GANHO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "crm"."ServiceOrderPhotoCategory" AS ENUM ('ANTES', 'DURANTE', 'DEPOIS');

-- CreateEnum
CREATE TYPE "crm"."ProjectDocumentType" AS ENUM ('CONTRATO', 'ART', 'PROJETO', 'MEMORIAL', 'NOTA_FISCAL', 'FOTOS', 'GARANTIA', 'MANUAL', 'OUTRO');

-- CreateTable
CREATE TABLE "crm"."Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tradeName" TEXT,
    "address" TEXT,
    "logoUrl" TEXT,
    "document" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jobTitle" TEXT,
    "displayName" TEXT,
    "homePage" TEXT NOT NULL DEFAULT '/',
    "interfaceDensity" TEXT NOT NULL DEFAULT 'COMFORTABLE',
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" "crm"."UserRole" NOT NULL DEFAULT 'COMERCIAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."Lead" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "city" TEXT,
    "state" TEXT,
    "source" TEXT,
    "status" "crm"."LeadStatus" NOT NULL DEFAULT 'NOVO',
    "distributor" TEXT,
    "consumerUnit" TEXT,
    "consumptionKwh" DOUBLE PRECISION,
    "demandKw" DOUBLE PRECISION,
    "estimatedValue" DOUBLE PRECISION,
    "expectedSaving" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "ownerId" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."LeadFile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leadId" TEXT NOT NULL,

    CONSTRAINT "LeadFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."LeadEngineering" (
    "id" TEXT NOT NULL,
    "systemType" TEXT,
    "installedPower" DOUBLE PRECISION,
    "modules" INTEGER,
    "modulePower" DOUBLE PRECISION,
    "moduleBrand" TEXT,
    "inverter" TEXT,
    "distributor" TEXT,
    "consumerUnit" TEXT,
    "tariffGroup" TEXT,
    "consumerClass" TEXT,
    "contractedDemand" DOUBLE PRECISION,
    "measuredDemand" DOUBLE PRECISION,
    "roofType" TEXT,
    "roofArea" DOUBLE PRECISION,
    "roofOrientation" TEXT,
    "roofSlope" DOUBLE PRECISION,
    "shading" TEXT,
    "structureType" TEXT,
    "voltage" TEXT,
    "phase" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leadId" TEXT NOT NULL,

    CONSTRAINT "LeadEngineering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."LeadDimensioning" (
    "id" TEXT NOT NULL,
    "monthlyConsumption" DOUBLE PRECISION,
    "solarIrradiation" DOUBLE PRECISION,
    "lossFactor" DOUBLE PRECISION,
    "modulePower" DOUBLE PRECISION,
    "moduleQuantity" INTEGER,
    "installedPower" DOUBLE PRECISION,
    "estimatedGeneration" DOUBLE PRECISION,
    "systemValue" DOUBLE PRECISION,
    "energyTariff" DOUBLE PRECISION,
    "monthlySaving" DOUBLE PRECISION,
    "annualSaving" DOUBLE PRECISION,
    "paybackYears" DOUBLE PRECISION,
    "requiredArea" DOUBLE PRECISION,
    "estimatedSaving" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leadId" TEXT NOT NULL,

    CONSTRAINT "LeadDimensioning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "city" TEXT,
    "state" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "leadId" TEXT,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."Proposal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "systemPower" DOUBLE PRECISION,
    "monthlySaving" DOUBLE PRECISION,
    "annualSaving" DOUBLE PRECISION,
    "payback" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "validUntil" TIMESTAMP(3),
    "paymentTerms" TEXT,
    "executionDeadline" TEXT,
    "commercialNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leadId" TEXT,
    "clientId" TEXT,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL DEFAULT 'USINA_SOLAR',
    "status" TEXT NOT NULL DEFAULT 'NOVO',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."ProjectStage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TIMESTAMP(3),
    "responsible" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."ProjectTimeline" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."Activity" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "dueDate" TIMESTAMP(3),
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leadId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."Financial" (
    "id" TEXT NOT NULL,
    "saleValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "receivedValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Financial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."ServiceOrder" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "responsible" TEXT,
    "team" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "scheduleType" TEXT NOT NULL DEFAULT 'COMPROMISSO',
    "scheduledDate" TIMESTAMP(3),
    "startedDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "services" TEXT,
    "materials" TEXT,
    "notes" TEXT,
    "checklistArt" BOOLEAN NOT NULL DEFAULT false,
    "checklistProjectApproved" BOOLEAN NOT NULL DEFAULT false,
    "checklistMaterialsSeparated" BOOLEAN NOT NULL DEFAULT false,
    "checklistStructureInstalled" BOOLEAN NOT NULL DEFAULT false,
    "checklistModulesInstalled" BOOLEAN NOT NULL DEFAULT false,
    "checklistInverterInstalled" BOOLEAN NOT NULL DEFAULT false,
    "checklistDcCabling" BOOLEAN NOT NULL DEFAULT false,
    "checklistAcCabling" BOOLEAN NOT NULL DEFAULT false,
    "checklistCommissioning" BOOLEAN NOT NULL DEFAULT false,
    "checklistCustomerTraining" BOOLEAN NOT NULL DEFAULT false,
    "checklistDelivered" BOOLEAN NOT NULL DEFAULT false,
    "customerName" TEXT,
    "customerDocument" TEXT,
    "customerSignature" TEXT,
    "technicianName" TEXT,
    "technicianSignature" TEXT,
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ServiceOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."ServiceOrderSequence" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceOrderSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."ServiceOrderPhoto" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "category" "crm"."ServiceOrderPhotoCategory" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serviceOrderId" TEXT NOT NULL,

    CONSTRAINT "ServiceOrderPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."ServiceOrderTimeline" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serviceOrderId" TEXT NOT NULL,

    CONSTRAINT "ServiceOrderTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."ProjectDocument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" "crm"."ProjectDocumentType" NOT NULL,
    "notes" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."CashFlow" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "financialId" TEXT,

    CONSTRAINT "CashFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."FinancialInstallment" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "description" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "financialId" TEXT NOT NULL,

    CONSTRAINT "FinancialInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."FinancialAttachment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'COMPROVANTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "financialId" TEXT NOT NULL,

    CONSTRAINT "FinancialAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "crm"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LeadEngineering_leadId_key" ON "crm"."LeadEngineering"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadDimensioning_leadId_key" ON "crm"."LeadDimensioning"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_leadId_key" ON "crm"."Client"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_leadId_key" ON "crm"."Proposal"("leadId");

-- CreateIndex
CREATE INDEX "ProjectStage_projectId_completed_idx" ON "crm"."ProjectStage"("projectId", "completed");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectStage_projectId_position_key" ON "crm"."ProjectStage"("projectId", "position");

-- CreateIndex
CREATE INDEX "ProjectTimeline_projectId_idx" ON "crm"."ProjectTimeline"("projectId");

-- CreateIndex
CREATE INDEX "ProjectTimeline_projectId_createdAt_idx" ON "crm"."ProjectTimeline"("projectId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Financial_projectId_key" ON "crm"."Financial"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOrder_number_key" ON "crm"."ServiceOrder"("number");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOrder_projectId_key" ON "crm"."ServiceOrder"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOrderSequence_companyId_key" ON "crm"."ServiceOrderSequence"("companyId");

-- CreateIndex
CREATE INDEX "ServiceOrderPhoto_serviceOrderId_idx" ON "crm"."ServiceOrderPhoto"("serviceOrderId");

-- CreateIndex
CREATE INDEX "ServiceOrderPhoto_serviceOrderId_category_idx" ON "crm"."ServiceOrderPhoto"("serviceOrderId", "category");

-- CreateIndex
CREATE INDEX "ServiceOrderTimeline_serviceOrderId_idx" ON "crm"."ServiceOrderTimeline"("serviceOrderId");

-- CreateIndex
CREATE INDEX "ProjectDocument_projectId_idx" ON "crm"."ProjectDocument"("projectId");

-- CreateIndex
CREATE INDEX "ProjectDocument_projectId_type_idx" ON "crm"."ProjectDocument"("projectId", "type");

-- CreateIndex
CREATE INDEX "ProjectDocument_uploadedById_idx" ON "crm"."ProjectDocument"("uploadedById");

-- CreateIndex
CREATE INDEX "CashFlow_companyId_idx" ON "crm"."CashFlow"("companyId");

-- CreateIndex
CREATE INDEX "CashFlow_status_idx" ON "crm"."CashFlow"("status");

-- CreateIndex
CREATE INDEX "FinancialInstallment_financialId_idx" ON "crm"."FinancialInstallment"("financialId");

-- CreateIndex
CREATE INDEX "FinancialInstallment_dueDate_idx" ON "crm"."FinancialInstallment"("dueDate");

-- CreateIndex
CREATE INDEX "FinancialInstallment_status_idx" ON "crm"."FinancialInstallment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialInstallment_financialId_number_key" ON "crm"."FinancialInstallment"("financialId", "number");

-- CreateIndex
CREATE INDEX "FinancialAttachment_financialId_idx" ON "crm"."FinancialAttachment"("financialId");

-- AddForeignKey
ALTER TABLE "crm"."User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "crm"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."Lead" ADD CONSTRAINT "Lead_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "crm"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."Lead" ADD CONSTRAINT "Lead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "crm"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."LeadFile" ADD CONSTRAINT "LeadFile_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "crm"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."LeadEngineering" ADD CONSTRAINT "LeadEngineering_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "crm"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."LeadDimensioning" ADD CONSTRAINT "LeadDimensioning_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "crm"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."Client" ADD CONSTRAINT "Client_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "crm"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."Client" ADD CONSTRAINT "Client_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "crm"."Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."Proposal" ADD CONSTRAINT "Proposal_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "crm"."Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."Proposal" ADD CONSTRAINT "Proposal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "crm"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."Project" ADD CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "crm"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "crm"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."ProjectStage" ADD CONSTRAINT "ProjectStage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "crm"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."ProjectTimeline" ADD CONSTRAINT "ProjectTimeline_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "crm"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."Activity" ADD CONSTRAINT "Activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "crm"."Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "crm"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."Financial" ADD CONSTRAINT "Financial_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "crm"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."Financial" ADD CONSTRAINT "Financial_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "crm"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."ServiceOrder" ADD CONSTRAINT "ServiceOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "crm"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."ServiceOrder" ADD CONSTRAINT "ServiceOrder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "crm"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."ServiceOrderPhoto" ADD CONSTRAINT "ServiceOrderPhoto_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "crm"."ServiceOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."ServiceOrderTimeline" ADD CONSTRAINT "ServiceOrderTimeline_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "crm"."ServiceOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."ProjectDocument" ADD CONSTRAINT "ProjectDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "crm"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."ProjectDocument" ADD CONSTRAINT "ProjectDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "crm"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."CashFlow" ADD CONSTRAINT "CashFlow_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "crm"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."CashFlow" ADD CONSTRAINT "CashFlow_financialId_fkey" FOREIGN KEY ("financialId") REFERENCES "crm"."Financial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."FinancialInstallment" ADD CONSTRAINT "FinancialInstallment_financialId_fkey" FOREIGN KEY ("financialId") REFERENCES "crm"."Financial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."FinancialAttachment" ADD CONSTRAINT "FinancialAttachment_financialId_fkey" FOREIGN KEY ("financialId") REFERENCES "crm"."Financial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
