ALTER TABLE "crm"."LeadFile"
ADD COLUMN IF NOT EXISTS "observation" VARCHAR(160),
ADD COLUMN IF NOT EXISTS "uploadedById" TEXT;

CREATE INDEX IF NOT EXISTS "LeadFile_uploadedById_idx"
ON "crm"."LeadFile"("uploadedById");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'LeadFile_uploadedById_fkey'
      AND conrelid = '"crm"."LeadFile"'::regclass
  ) THEN
    ALTER TABLE "crm"."LeadFile"
    ADD CONSTRAINT "LeadFile_uploadedById_fkey"
    FOREIGN KEY ("uploadedById")
    REFERENCES "crm"."User"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END
$$;
