-- Add coverPhoto field to vendors table
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "coverPhoto" TEXT;
