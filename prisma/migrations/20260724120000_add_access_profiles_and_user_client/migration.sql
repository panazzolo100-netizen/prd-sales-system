-- Replace the legacy departmental roles with access profiles.
-- The explicit CASE expression guarantees that every existing user is preserved.
BEGIN;

CREATE TYPE "crm"."UserRole_new" AS ENUM (
  'EXECUTIVO',
  'GESTOR',
  'OPERADOR',
  'CLIENTE'
);

ALTER TABLE "crm"."User"
  ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "crm"."User"
  ALTER COLUMN "role" TYPE "crm"."UserRole_new"
  USING (
    CASE "role"::text
      WHEN 'ADMIN' THEN 'EXECUTIVO'
      WHEN 'COMERCIAL' THEN 'OPERADOR'
      WHEN 'ENGENHARIA' THEN 'OPERADOR'
      WHEN 'FINANCEIRO' THEN 'OPERADOR'
      ELSE NULL
    END
  )::"crm"."UserRole_new";

DROP TYPE "crm"."UserRole";
ALTER TYPE "crm"."UserRole_new" RENAME TO "UserRole";

ALTER TABLE "crm"."User"
  ALTER COLUMN "role" SET DEFAULT 'OPERADOR',
  ADD COLUMN "clientId" TEXT;

CREATE INDEX "User_companyId_clientId_idx"
  ON "crm"."User"("companyId", "clientId");

ALTER TABLE "crm"."User"
  ADD CONSTRAINT "User_clientId_fkey"
  FOREIGN KEY ("clientId")
  REFERENCES "crm"."Client"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

COMMIT;
