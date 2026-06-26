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
      ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "contractUrl" TEXT;
      ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

      ALTER TABLE "draaiboek_items" ADD COLUMN IF NOT EXISTS "vendorBookingId" TEXT;
      ALTER TABLE "draaiboek_items" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE "draaiboek_items" ADD COLUMN IF NOT EXISTS "phase" TEXT;

      ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "vendorBookingId" TEXT;

      ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "vendorBookingId" TEXT;

      CREATE TABLE IF NOT EXISTS "direct_conversations" (
        "id" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "direct_conversations_pkey" PRIMARY KEY ("id")
      );

      CREATE TABLE IF NOT EXISTS "direct_conversation_participants" (
        "conversationId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        CONSTRAINT "direct_conversation_participants_pkey" PRIMARY KEY ("conversationId", "userId"),
        CONSTRAINT "dcp_conv_fk" FOREIGN KEY ("conversationId") REFERENCES "direct_conversations"("id") ON DELETE CASCADE,
        CONSTRAINT "dcp_user_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "direct_messages" (
        "id" TEXT NOT NULL,
        "conversationId" TEXT NOT NULL,
        "senderId" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "dm_conv_fk" FOREIGN KEY ("conversationId") REFERENCES "direct_conversations"("id") ON DELETE CASCADE,
        CONSTRAINT "dm_sender_fk" FOREIGN KEY ("senderId") REFERENCES "users"("id")
      );

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
    // Remove duplicate draaiboek items — keep the earliest per (draaiboekId, vendorId, title, startTime)
    await pool.query(`
      DELETE FROM "draaiboek_items"
      WHERE id NOT IN (
        SELECT DISTINCT ON ("draaiboekId", "vendorId", title, "startTime") id
        FROM "draaiboek_items"
        ORDER BY "draaiboekId", "vendorId", title, "startTime", "createdAt" ASC
      );
    `);
    console.log("✅ Draaiboek duplicates cleaned");
    console.log("✅ Schema columns OK");
  } catch (err) {
    console.error("⚠️  Schema migration warning:", err.message);
  } finally {
    await pool.end();
  }
}

main();
