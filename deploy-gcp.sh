#!/usr/bin/env bash
# ============================================================
# ExcelTutor AI — One-shot GCP Deploy Script
# ============================================================
# Cara pakai:
#   bash deploy-gcp.sh
#
# Script ini akan:
#   1. Git pull update terbaru
#   2. Install dependencies jika belum ada (Node, pnpm, FFmpeg, edge-tts)
#   3. Build Next.js
#   4. Jalankan dengan PM2 (auto-restart, log)
# ============================================================
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-3000}"

echo "============================================================"
echo "  ExcelTutor AI — GCP Deploy"
echo "  Dir : $APP_DIR"
echo "  Port: $PORT"
echo "============================================================"
echo ""

cd "$APP_DIR"

# ─── 1. Git Pull ──────────────────────────────────────────────
echo -e "${GREEN}[1/5]${NC} Git pull..."
git pull origin main
echo "   ✅ Up to date"
echo ""

# ─── 2. Node.js & pnpm ───────────────────────────────────────
echo -e "${GREEN}[2/5]${NC} Checking Node.js & pnpm..."

# Node.js
if command -v node &> /dev/null; then
  echo "   Node.js: $(node --version)"
else
  echo -e "${RED}   ❌ Node.js tidak ditemukan. Install via:${NC}"
  echo "      curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -"
  echo "      sudo apt-get install -y nodejs"
  exit 1
fi

# pnpm
if ! command -v pnpm &> /dev/null; then
  echo "   ⏳ Installing pnpm..."
  npm install -g pnpm
fi
echo "   pnpm: $(pnpm --version)"
echo ""

# ─── 3. FFmpeg ────────────────────────────────────────────────
echo -e "${GREEN}[3/5]${NC} Checking FFmpeg..."
if command -v ffmpeg &> /dev/null; then
  echo "   FFmpeg: $(ffmpeg -version 2>&1 | head -1)"
else
  echo -e "${YELLOW}   ⚠️  FFmpeg tidak ditemukan, install...${NC}"
  sudo apt-get update -qq && sudo apt-get install -y -qq ffmpeg
  echo "   ✅ FFmpeg installed"
fi
echo ""

# ─── 4. Edge TTS (Python) ────────────────────────────────────
echo -e "${GREEN}[4/5]${NC} Checking Edge TTS..."
PYTHON_CMD=""
if command -v python3 &> /dev/null; then
  PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
  PYTHON_CMD="python"
fi

if [ -z "$PYTHON_CMD" ]; then
  echo -e "${YELLOW}   ⚠️  Python tidak ditemukan, install...${NC}"
  sudo apt-get update -qq && sudo apt-get install -y -qq python3 python3-pip
  PYTHON_CMD="python3"
fi

if $PYTHON_CMD -c "import edge_tts" 2>/dev/null; then
  echo "   Edge TTS: installed"
else
  echo "   ⏳ Installing edge-tts..."
  $PYTHON_CMD -m pip install edge-tts -q
  echo "   ✅ Edge TTS installed"
fi
echo ""

# ─── 5. Install node_modules & build ─────────────────────────
echo -e "${GREEN}[5/5]${NC} Installing & building..."

# Install kalau belum ada node_modules
if [ ! -d "node_modules" ]; then
  echo "   ⏳ pnpm install..."
  pnpm install
  echo "   ✅ Dependencies installed"
else
  echo "   ✅ node_modules exists — pnpm install (update)..."
  pnpm install
fi

# .env.local — fallback
if [ ! -f ".env.local" ]; then
  if [ -f ".env" ]; then
    cp .env .env.local
  elif [ -f ".env.example" ]; then
    cp .env.example .env.local
  fi
  echo -e "${YELLOW}   ⚠️  .env.local dibuat — JANGAN LUPA isi DEEPSEEK_API_KEY jika belum ada${NC}"
fi

# Build
echo "   🔨 Building..."
pnpm build
echo "   ✅ Build complete"
echo ""

# ─── PM2 ──────────────────────────────────────────────────────
echo "============================================================"
echo "  Starting with PM2..."
echo "============================================================"
echo ""

if command -v pm2 &> /dev/null; then
  echo "   PM2: $(pm2 --version)"
else
  echo "   ⏳ Installing PM2..."
  npm install -g pm2
  echo "   ✅ PM2 installed"
fi

# Stop & cleanup kalau existing
pm2 delete exceltutor 2>/dev/null || true

# Pastikan logs dir ada
mkdir -p "$APP_DIR/logs"

# Start via PM2
PORT="$PORT" pm2 start ecosystem.config.cjs
pm2 save

echo ""
echo "============================================================"
echo -e "  ${GREEN}✅ Deploy selesai!${NC}"
echo ""
echo -e "  App : http://localhost:${PORT}"
echo -e "  Log : ${YELLOW}pm2 logs exceltutor${NC}"
echo -e "  Log : ${YELLOW}curl http://localhost:${PORT}/api/logs${NC}"
echo ""
echo "  Useful commands:"
echo "    pm2 status              — cek status"
echo "    pm2 logs exceltutor     — lihat log real-time"
echo "    pm2 restart exceltutor  — restart app"
echo "    bash deploy-gcp.sh      — update & redeploy"
echo "============================================================"
