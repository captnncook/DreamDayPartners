-- Add missing columns to vendors
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "priceFrom" INTEGER;

-- Add missing columns to wedding_vendors
ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "intakeData" JSONB;
ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "depositAmount" DOUBLE PRECISION;
ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "depositDue" TIMESTAMP(3);
ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "depositPaid" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "finalAmount" DOUBLE PRECISION;
ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "finalDue" TIMESTAMP(3);
ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "finalPaid" BOOLEAN NOT NULL DEFAULT false;

-- Add missing columns to tasks
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "vendorBookingId" TEXT;

-- Add missing columns to draaiboek_items
ALTER TABLE "draaiboek_items" ADD COLUMN IF NOT EXISTS "vendorBookingId" TEXT;
ALTER TABLE "draaiboek_items" ADD COLUMN IF NOT EXISTS "phase" TEXT;

-- Add missing columns to documents
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "vendorBookingId" TEXT;

-- Create deliverables table
CREATE TABLE IF NOT EXISTS "deliverables" (
    "id" TEXT NOT NULL,
    "vendorBookingId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueDate" TIMESTAMP(3),
    "approvalRequired" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints (only if they don't exist yet)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_vendorBookingId_fkey'
  ) THEN
    ALTER TABLE "tasks" ADD CONSTRAINT "tasks_vendorBookingId_fkey"
      FOREIGN KEY ("vendorBookingId") REFERENCES "wedding_vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'di_vendorBookingId_fkey'
  ) THEN
    ALTER TABLE "draaiboek_items" ADD CONSTRAINT "di_vendorBookingId_fkey"
      FOREIGN KEY ("vendorBookingId") REFERENCES "wedding_vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'documents_vendorBookingId_fkey'
  ) THEN
    ALTER TABLE "documents" ADD CONSTRAINT "documents_vendorBookingId_fkey"
      FOREIGN KEY ("vendorBookingId") REFERENCES "wedding_vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'deliverables_vendorBookingId_fkey'
  ) THEN
    ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_vendorBookingId_fkey"
      FOREIGN KEY ("vendorBookingId") REFERENCES "wedding_vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
