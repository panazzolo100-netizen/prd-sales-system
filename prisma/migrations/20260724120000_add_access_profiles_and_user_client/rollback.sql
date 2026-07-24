-- Manual rollback for 20260724120000_add_access_profiles_and_user_client.
-- CLIENTE and GESTOR have no exact legacy equivalent and are conservatively
-- converted to COMERCIAL. Review those users before running this script.
BEGIN;

CREATE TYPE "crm"."UserRole_legacy" AS ENUM (
  'ADMIN',
  'COMERCIAL',
  'ENGENHARIA',
  'FINANCEIRO'
);

DROP INDEX "crm"."User_companyId_clientId_idx";

ALTER TABLE "crm"."User"
  DROP CONSTRAINT "User_clientId_fkey",
  DROP COLUMN "clientId",
  ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "crm"."User"
  ALTER COLUMN "role" TYPE "crm"."UserRole_legacy"
  USING (
    CASE "role"::text
      WHEN 'EXECUTIVO' THEN 'ADMIN'
      ELSE 'COMERCIAL'
    END
  )::"crm"."UserRole_legacy";

DROP TYPE "crm"."UserRole";
ALTER TYPE "crm"."UserRole_legacy" RENAME TO "UserRole";

ALTER TABLE "crm"."User"
  ALTER COLUMN "role" SET DEFAULT 'COMERCIAL';

COMMIT;
