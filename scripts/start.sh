#!/usr/bin/env bash
# ============================================================
# ExcelTutor AI — Production Build & Start
# ============================================================
set -e

echo "🏗️  Building ExcelTutor AI for production..."
echo ""

# Check .env.local
if [ ! -f ".env.local" ]; then
  echo "⚠️  .env.local not found!"
  cp .env.example .env.local
  echo "   JANGAN LUPA isi DEEPSEEK_API_KEY di .env.local!"
  exit 1
fi

# Build
echo "🔨 Running build..."
pnpm build
echo "   ✅ Build complete"
echo ""

# Start
echo "🚀 Starting production server..."
echo "   Server: http://localhost:${PORT:-3000}"
echo ""
pnpm start
