#!/bin/bash
# Quick database seeding script for EC2 deployment
# Usage: ./scripts/seed.sh

set -e

echo "🌱 Starting database seeding..."
echo ""

# Check if tsx is available
if ! command -v tsx &> /dev/null; then
    echo "📦 Installing tsx..."
    npm install -D tsx
fi

# Run the seeding script
echo "📊 Running seed script..."
tsx scripts/seed-database.ts

echo ""
echo "✅ Seeding complete! You're ready to go!"
