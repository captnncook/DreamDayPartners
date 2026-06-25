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
    `);
    console.log("✅ Schema columns OK");
  } catch (err) {
    console.error("⚠️  Schema migration warning:", err.message);
  } finally {
    await pool.end();
  }
}

main();
