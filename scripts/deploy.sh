#!/bin/bash

echo "=== DreamDay Partners Deploy ==="

echo "Applying schema columns..."
node scripts/ensure-schema.js

echo "Running prisma migrate deploy..."
npx prisma migrate deploy || echo "Migrate warning (continuing)"

echo "Running seed..."
npm run db:seed || echo "Seed skipped"

echo "Starting app..."
exec npm start
