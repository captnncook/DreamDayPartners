// Ensure all required DB columns exist before app starts
const { Pool } = require("pg");

const STATEMENTS = [
  `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "description" TEXT`,
  `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "isPremium" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "photos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`,
  `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "city" TEXT`,
  `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION`,
  `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION`,
  `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "priceFrom" INTEGER`,
  `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "priceTo" INTEGER`,
  `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "priceUnit" TEXT`,
  `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "specializations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`,
  `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "busyDates" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`,
  `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "coverPhoto" TEXT`,
  `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "emblemPhoto" TEXT`,
  `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "contactPerson" TEXT`,
  `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`,

  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailNewMessage" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailNewTask" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailWeddingUpdate" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailWeeklyDigest" BOOLEAN NOT NULL DEFAULT true`,

  `CREATE TABLE IF NOT EXISTS "vendor_claim_requests" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "token" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    CONSTRAINT "vendor_claim_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "vcr_token_key" UNIQUE ("token"),
    CONSTRAINT "vcr_vendor_fk" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "prt_user_key" UNIQUE ("userId"),
    CONSTRAINT "prt_token_key" UNIQUE ("token"),
    CONSTRAINT "prt_user_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS "vendor_delete_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vendor_delete_tokens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "vdt_user_key" UNIQUE ("userId"),
    CONSTRAINT "vdt_token_key" UNIQUE ("token"),
    CONSTRAINT "vdt_user_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS "pending_registrations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "codeExpiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pending_registrations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "pr_verified_token_key" UNIQUE ("verifiedToken")
  )`,

  `ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "intakeData" JSONB`,
  `ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "depositAmount" DOUBLE PRECISION`,
  `ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "depositDue" TIMESTAMP(3)`,
  `ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "depositPaid" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "finalAmount" DOUBLE PRECISION`,
  `ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "finalDue" TIMESTAMP(3)`,
  `ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "finalPaid" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "contractUrl" TEXT`,
  `ALTER TABLE "wedding_vendors" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`,

  `ALTER TABLE "draaiboek_items" ADD COLUMN IF NOT EXISTS "vendorBookingId" TEXT`,
  `ALTER TABLE "draaiboek_items" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "draaiboek_items" ADD COLUMN IF NOT EXISTS "phase" TEXT`,
  `ALTER TABLE "draaiboek_items" ADD COLUMN IF NOT EXISTS "assignedUserId" TEXT`,

  `ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "vendorBookingId" TEXT`,

  `ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "vendorBookingId" TEXT`,

  `CREATE TABLE IF NOT EXISTS "direct_conversations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "direct_conversations_pkey" PRIMARY KEY ("id")
  )`,

  `CREATE TABLE IF NOT EXISTS "direct_conversation_participants" (
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "direct_conversation_participants_pkey" PRIMARY KEY ("conversationId", "userId"),
    CONSTRAINT "dcp_conv_fk" FOREIGN KEY ("conversationId") REFERENCES "direct_conversations"("id") ON DELETE CASCADE,
    CONSTRAINT "dcp_user_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS "direct_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "dm_conv_fk" FOREIGN KEY ("conversationId") REFERENCES "direct_conversations"("id") ON DELETE CASCADE,
    CONSTRAINT "dm_sender_fk" FOREIGN KEY ("senderId") REFERENCES "users"("id")
  )`,

  `CREATE TABLE IF NOT EXISTS "vendor_wedding_invites" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "email1" TEXT NOT NULL,
    "email2" TEXT,
    "weddingDate" TIMESTAMP(3) NOT NULL,
    "weddingTitle" TEXT,
    "weddingId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vendor_wedding_invites_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "vwi_vendor_fk" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE,
    CONSTRAINT "vwi_wedding_fk" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "deliverables" (
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
  )`,
];

const CLEANUP = [
  // Remove duplicate draaiboek items — keep earliest per (draaiboekId, vendorId, title, startTime)
  `DELETE FROM "draaiboek_items"
   WHERE id NOT IN (
     SELECT DISTINCT ON ("draaiboekId", "vendorId", title, "startTime") id
     FROM "draaiboek_items"
     ORDER BY "draaiboekId", "vendorId", title, "startTime", "createdAt" ASC
   )`,
  // Remove duplicate guests — keep earliest per (weddingId, email)
  `DELETE FROM "guests"
   WHERE email IS NOT NULL AND id NOT IN (
     SELECT DISTINCT ON ("weddingId", email) id
     FROM "guests"
     WHERE email IS NOT NULL
     ORDER BY "weddingId", email, "createdAt" ASC
   )`,
  // Remove duplicate budget items — keep earliest per (budgetId, description)
  `DELETE FROM "budget_items"
   WHERE id NOT IN (
     SELECT DISTINCT ON ("budgetId", description) id
     FROM "budget_items"
     ORDER BY "budgetId", description, "createdAt" ASC
   )`,
  // Remove duplicate tasks — keep earliest per (weddingId, title)
  `DELETE FROM "tasks"
   WHERE id NOT IN (
     SELECT DISTINCT ON ("weddingId", title) id
     FROM "tasks"
     ORDER BY "weddingId", title, "createdAt" ASC
   )`,
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let ok = 0;
  let failed = 0;

  for (const sql of STATEMENTS) {
    try {
      await pool.query(sql);
      ok++;
    } catch (err) {
      console.error(`⚠️  Schema warning [${sql.slice(0, 60).trim()}...]: ${err.message}`);
      failed++;
    }
  }

  for (const sql of CLEANUP) {
    try {
      await pool.query(sql);
    } catch (err) {
      console.error(`⚠️  Cleanup warning: ${err.message}`);
    }
  }

  await pool.end();
  console.log(`✅ Schema check done: ${ok} OK, ${failed} warnings`);
  console.log("✅ Duplicates cleaned");
}

main();
