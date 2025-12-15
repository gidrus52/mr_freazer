#!/bin/sh
set -e

echo "🚀 Starting backend application..."

# Wait for database to be ready using a simple Node.js check
echo "⏳ Waiting for database to be ready..."
RETRIES=30
until node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => {
    console.log('Database connected');
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });
" 2>/dev/null || [ $RETRIES -eq 0 ]; do
  echo "Database is unavailable - sleeping ($RETRIES retries left)"
  RETRIES=$((RETRIES-1))
  sleep 2
done

if [ $RETRIES -eq 0 ]; then
  echo "❌ Database connection failed after 60 seconds"
  exit 1
fi

echo "✅ Database is ready!"

# Run Prisma migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy || echo "⚠️  Migration failed or no migrations to run"

# Start the application
echo "🎯 Starting NestJS application..."
exec node dist/main.js

