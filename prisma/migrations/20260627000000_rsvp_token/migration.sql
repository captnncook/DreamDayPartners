ALTER TABLE "weddings" ADD COLUMN IF NOT EXISTS "rsvpToken" TEXT;
UPDATE "weddings" SET "rsvpToken" = gen_random_uuid()::text WHERE "rsvpToken" IS NULL;
ALTER TABLE "weddings" ALTER COLUMN "rsvpToken" SET NOT NULL;
ALTER TABLE "weddings" ADD CONSTRAINT "weddings_rsvpToken_key" UNIQUE ("rsvpToken");
