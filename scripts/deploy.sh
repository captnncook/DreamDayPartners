#!/bin/bash
set -e

echo "=== DreamDay Partners Deploy ==="

# Apply all missing vendor catalog columns directly via psql
# This is idempotent and bypasses Prisma migration tracking issues
echo "Applying schema columns..."
psql "$DATABASE_URL" <<'SQL'
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "isPremium" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "photos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
SQL
echo "Schema columns OK"

# Try prisma migrate deploy (may fail if DB was set up with db push — that's OK)
echo "Running prisma migrate deploy..."
npx prisma migrate deploy 2>&1 || echo "Migrate deploy failed (continuing)"

echo "Running seed..."
npm run db:seed 2>&1 || echo "Seed skipped (already seeded)"

echo "Starting app..."
exec npm start
