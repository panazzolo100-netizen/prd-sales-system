CREATE TABLE "crm"."AgendaEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'OUTRO',
    "status" TEXT NOT NULL DEFAULT 'AGENDADO',
    "color" TEXT NOT NULL DEFAULT 'ORANGE',
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "location" TEXT,
    "description" TEXT,
    "companyId" TEXT NOT NULL,
    "responsibleId" TEXT,
    "createdById" TEXT NOT NULL,
    "clientId" TEXT,
    "leadId" TEXT,
    "projectId" TEXT,
    "serviceOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgendaEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AgendaEvent_companyId_startAt_idx"
ON "crm"."AgendaEvent"("companyId", "startAt");

CREATE INDEX "AgendaEvent_companyId_responsibleId_startAt_idx"
ON "crm"."AgendaEvent"("companyId", "responsibleId", "startAt");

CREATE INDEX "AgendaEvent_clientId_idx"
ON "crm"."AgendaEvent"("clientId");

CREATE INDEX "AgendaEvent_leadId_idx"
ON "crm"."AgendaEvent"("leadId");

CREATE INDEX "AgendaEvent_projectId_idx"
ON "crm"."AgendaEvent"("projectId");

CREATE INDEX "AgendaEvent_serviceOrderId_idx"
ON "crm"."AgendaEvent"("serviceOrderId");

ALTER TABLE "crm"."AgendaEvent"
ADD CONSTRAINT "AgendaEvent_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "crm"."Company"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "crm"."AgendaEvent"
ADD CONSTRAINT "AgendaEvent_responsibleId_fkey"
FOREIGN KEY ("responsibleId") REFERENCES "crm"."User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "crm"."AgendaEvent"
ADD CONSTRAINT "AgendaEvent_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "crm"."User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "crm"."AgendaEvent"
ADD CONSTRAINT "AgendaEvent_clientId_fkey"
FOREIGN KEY ("clientId") REFERENCES "crm"."Client"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "crm"."AgendaEvent"
ADD CONSTRAINT "AgendaEvent_leadId_fkey"
FOREIGN KEY ("leadId") REFERENCES "crm"."Lead"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "crm"."AgendaEvent"
ADD CONSTRAINT "AgendaEvent_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "crm"."Project"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "crm"."AgendaEvent"
ADD CONSTRAINT "AgendaEvent_serviceOrderId_fkey"
FOREIGN KEY ("serviceOrderId") REFERENCES "crm"."ServiceOrder"("id")
ON DELETE SET NULL ON UPDATE CASCADE;