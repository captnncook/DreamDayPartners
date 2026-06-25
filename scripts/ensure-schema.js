// Ensure all required DB columns exist before app starts
const { Pool } = require("pg");

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(`
      ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "description" TEXT;
      ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "isPremium" BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "photos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
      ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "city" TEXT;
      ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
      ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
      ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "priceFrom" INTEGER;
      ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

      ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "intakeData" JSONB;
      ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "depositAmount" DOUBLE PRECISION;
      ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "depositDue" TIMESTAMP(3);
      ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "depositPaid" BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "finalAmount" DOUBLE PRECISION;
      ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "finalDue" TIMESTAMP(3);
      ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "finalPaid" BOOLEAN NOT NULL DEFAULT false;

      ALTER TABLE "draaiboek_items" ADD COLUMN IF NOT EXISTS "vendorBookingId" TEXT;
      ALTER TABLE "draaiboek_items" ADD COLUMN IF NOT EXISTS "phase" TEXT;

      ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "vendorBookingId" TEXT;

      ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "vendorBookingId" TEXT;

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
    `);
    console.log("✅ Schema columns OK");
  } catch (err) {
    console.error("⚠️  Schema migration warning:", err.message);
  } finally {
    await pool.end();
  }
}

main();
