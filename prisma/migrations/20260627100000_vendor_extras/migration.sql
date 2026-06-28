-- Add new vendor fields
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "priceTo" INTEGER;
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "specializations" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "busyDates" TEXT[] NOT NULL DEFAULT '{}';

-- VendorContactRequest
CREATE TABLE IF NOT EXISTS "vendor_contact_requests" (
  "id"          TEXT NOT NULL,
  "vendorId"    TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "email"       TEXT NOT NULL,
  "phone"       TEXT,
  "message"     TEXT NOT NULL,
  "weddingDate" TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "vendor_contact_requests_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "vendor_contact_requests_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE
);

-- VendorReview
CREATE TABLE IF NOT EXISTS "vendor_reviews" (
  "id"        TEXT NOT NULL,
  "vendorId"  TEXT NOT NULL,
  "weddingId" TEXT NOT NULL,
  "authorId"  TEXT NOT NULL,
  "rating"    INTEGER NOT NULL,
  "text"      TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "vendor_reviews_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "vendor_reviews_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE,
  CONSTRAINT "vendor_reviews_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "weddings"("id") ON DELETE CASCADE,
  CONSTRAINT "vendor_reviews_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "vendor_reviews_vendorId_weddingId_authorId_key"
  ON "vendor_reviews"("vendorId", "weddingId", "authorId");
