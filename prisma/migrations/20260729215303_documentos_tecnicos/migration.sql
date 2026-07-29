-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "crm"."ProjectDocumentType" ADD VALUE 'PROJECT_UNIFILAR';
ALTER TYPE "crm"."ProjectDocumentType" ADD VALUE 'PROJECT_TRIFILAR';
ALTER TYPE "crm"."ProjectDocumentType" ADD VALUE 'PLANTA_BAIXA';
ALTER TYPE "crm"."ProjectDocumentType" ADD VALUE 'CARTA_APROVACAO';
ALTER TYPE "crm"."ProjectDocumentType" ADD VALUE 'OUTROS_TECNICOS';
