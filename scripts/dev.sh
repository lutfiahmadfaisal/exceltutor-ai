#!/usr/bin/env bash
# ============================================================
# ExcelTutor AI — Development Server
# ============================================================
set -e

echo "🚀 Starting ExcelTutor AI (development)..."
echo ""

# Check .env.local
if [ ! -f ".env.local" ]; then
  echo "⚠️  .env.local not found. Copy from .env.example"
  cp .env.example .env.local
  echo "   JANGAN LUPA isi DEEPSEEK_API_KEY di .env.local!"
fi

# Export env vars
export $(grep -v '^#' .env.local | xargs) 2>/dev/null || true

echo "📡 Server akan berjalan di: http://localhost:${PORT:-3000}"
echo ""

# Start Next.js dev server
pnpm dev
