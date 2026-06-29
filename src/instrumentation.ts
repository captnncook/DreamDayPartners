export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { Pool } = await import("pg");

    const STATEMENTS = [
      `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "description" TEXT`,
      `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "isPremium" BOOLEAN NOT NULL DEFAULT false`,
      `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "coverPhoto" TEXT`,
      `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "emblemPhoto" TEXT`,
      `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "photos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "city" TEXT`,
      `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION`,
      `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION`,
      `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "priceFrom" INTEGER`,
      `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "priceTo" INTEGER`,
      `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "priceUnit" TEXT`,
      `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "specializations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "busyDates" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`,
      `ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`,

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

      `CREATE TABLE IF NOT EXISTS "vendor_contact_requests" (
        "id" TEXT NOT NULL,
        "vendorId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT,
        "message" TEXT NOT NULL,
        "weddingDate" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "vendor_contact_requests_pkey" PRIMARY KEY ("id")
      )`,

      `CREATE TABLE IF NOT EXISTS "vendor_reviews" (
        "id" TEXT NOT NULL,
        "vendorId" TEXT NOT NULL,
        "weddingId" TEXT NOT NULL,
        "authorId" TEXT NOT NULL,
        "rating" INTEGER NOT NULL,
        "text" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "vendor_reviews_pkey" PRIMARY KEY ("id")
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

      `CREATE TABLE IF NOT EXISTS "direct_conversations" (
        "id" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "direct_conversations_pkey" PRIMARY KEY ("id")
      )`,

      `CREATE TABLE IF NOT EXISTS "direct_conversation_participants" (
        "conversationId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        CONSTRAINT "direct_conversation_participants_pkey" PRIMARY KEY ("conversationId", "userId")
      )`,

      `CREATE TABLE IF NOT EXISTS "direct_messages" (
        "id" TEXT NOT NULL,
        "conversationId" TEXT NOT NULL,
        "senderId" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id")
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
        CONSTRAINT "vendor_wedding_invites_pkey" PRIMARY KEY ("id")
      )`,
    ];

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    let ok = 0;
    let failed = 0;

    for (const sql of STATEMENTS) {
      try {
        await pool.query(sql);
        ok++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[instrumentation] schema warning: ${msg.slice(0, 120)}`);
        failed++;
      }
    }

    await pool.end();
    console.log(`[instrumentation] schema done: ${ok} OK, ${failed} warnings`);
  }
}
