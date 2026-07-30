-- AlterTable
ALTER TABLE "crm"."User" ADD COLUMN     "forcePasswordChange" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "temporaryPassword" BOOLEAN NOT NULL DEFAULT true;
