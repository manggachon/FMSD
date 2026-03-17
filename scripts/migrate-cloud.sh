#!/bin/bash
# Run Prisma migrations and seed against the cloud database
# Usage: bash scripts/migrate-cloud.sh

set -e

CLOUD_DB_URL="postgresql://T77lhWxRDtlhd179:MlbrbqnpLKWg00n3esWwh6OPKpV3I2di@srv1457726.hstgr.cloud:5432/J1FnEW73n6AB74Pv?schema=public"

echo "==> Running migrations on cloud database..."
cd server
DATABASE_URL="$CLOUD_DB_URL" npx prisma migrate deploy

echo "==> Seeding cloud database..."
DATABASE_URL="$CLOUD_DB_URL" npx tsx prisma/seed.ts

echo "==> Done! Cloud database is ready."
