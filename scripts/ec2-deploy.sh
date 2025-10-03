#!/bin/bash
# EC2 Quick Deploy & Seed Script
# This script sets up the database and seeds it with sample data
# Usage: ./scripts/ec2-deploy.sh

set -e

echo "🚀 LPR-RAMS EC2 Deployment & Seeding"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating one..."
    cat > .env << EOF
DATABASE_URL=postgresql://dev:2240@localhost:5432/lpr
PUBLIC_BASE_URL=http://localhost:5174
NODE_ENV=production
EOF
    echo "✅ Created .env file"
    echo "⚠️  Please update DATABASE_URL and PUBLIC_BASE_URL in .env"
    echo ""
fi

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running!"
    echo "   Start it with: sudo systemctl start postgresql"
    exit 1
fi
echo "✅ PostgreSQL is running"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Push database schema
echo "📊 Pushing database schema..."
npm run db:push
echo ""

# Seed the database
echo "🌱 Seeding database with sample data..."
npm run seed
echo ""

# Build the application
echo "🔨 Building application..."
npm run build
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Start the app: npm start"
echo "   2. Or use PM2: pm2 start npm --name lpr-app -- start"
echo "   3. Login as admin: username=admin, password=admin123"
echo ""
echo "📖 For more details, see EC2_DEPLOYMENT.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
