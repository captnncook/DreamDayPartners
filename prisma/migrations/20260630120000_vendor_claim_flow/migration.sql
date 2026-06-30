-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "vendor_claim_requests" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "token" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "vendor_claim_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "vendor_claim_requests_token_key" ON "vendor_claim_requests"("token");

-- AddForeignKey
ALTER TABLE "vendor_claim_requests" ADD CONSTRAINT "vendor_claim_requests_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
