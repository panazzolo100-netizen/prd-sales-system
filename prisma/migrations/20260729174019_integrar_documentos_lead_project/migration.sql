-- DropForeignKey
ALTER TABLE "crm"."ProjectDocument" DROP CONSTRAINT "ProjectDocument_projectId_fkey";

-- AlterTable
ALTER TABLE "crm"."ProjectDocument" ADD COLUMN     "leadId" TEXT,
ALTER COLUMN "projectId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "ProjectDocument_leadId_idx" ON "crm"."ProjectDocument"("leadId");

-- CreateIndex
CREATE INDEX "ProjectDocument_leadId_type_idx" ON "crm"."ProjectDocument"("leadId", "type");

-- AddForeignKey
ALTER TABLE "crm"."ProjectDocument" ADD CONSTRAINT "ProjectDocument_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "crm"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."ProjectDocument" ADD CONSTRAINT "ProjectDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "crm"."Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
