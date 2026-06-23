#!/bin/bash
set -e

echo "=== DreamDay Partners Deploy ==="

# Baseline the initial migrations if _prisma_migrations table doesn't exist or is empty
# This handles the case where DB was set up with `prisma db push` instead of migrations
echo "Running migrations..."
npx prisma migrate deploy 2>&1 || {
  echo "Migration deploy failed, attempting to resolve baseline..."
  npx prisma migrate resolve --applied 20260620000000_pg_init 2>/dev/null || true
  npx prisma migrate resolve --applied 20260620172357_init 2>/dev/null || true
  npx prisma migrate deploy 2>&1 || echo "Migration still failing, continuing with manual column check..."
}

# Ensure vendor catalog columns exist (idempotent)
echo "Ensuring vendor catalog columns..."
npx prisma db execute --stdin <<'SQL' 2>/dev/null || true
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "isPremium" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "photos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
SQL

echo "Running seed..."
npm run db:seed 2>&1 || echo "Seed failed or already seeded, continuing..."

echo "Starting app..."
npm start
