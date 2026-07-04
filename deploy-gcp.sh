#!/usr/bin/env bash
# ============================================================
# ExcelTutor AI — One-shot GCP Deploy Script
# ============================================================
# Cara pakai:
#   bash deploy-gcp.sh
#
# Script ini akan:
#   1. Git pull update terbaru
#   2. Install dependencies (Node, pnpm, FFmpeg, edge-tts)
#   3. Build Next.js production
#   4. Jalankan dengan PM2 (auto-restart, log)
#   5. Restart Cloudflare Tunnel (jika ada)
# ============================================================
set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-3000}"
DOMAIN="${DOMAIN:-sunsinsue.my.id}"

echo ""
echo "============================================================"
echo -e "  ${CYAN}ExcelTutor AI — GCP Deploy${NC}"
echo "  Dir : $APP_DIR"
echo "  Port: $PORT"
echo "  Domain: $DOMAIN"
echo "============================================================"
echo ""

cd "$APP_DIR"

# ─── 1. Git Pull ──────────────────────────────────────────────
echo -e "${GREEN}[1/6]${NC} Git pull..."
git pull --rebase origin main 2>/dev/null || git pull origin main
echo "   ✅ Up to date"
echo ""

# ─── 2. Node.js & pnpm ───────────────────────────────────────
echo -e "${GREEN}[2/6]${NC} Checking Node.js & pnpm..."

if ! command -v node &> /dev/null; then
  echo -e "${RED}   ❌ Node.js tidak ditemukan. Install dulu:${NC}"
  echo "      curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -"
  echo "      sudo apt-get install -y nodejs"
  exit 1
fi
echo "   Node.js: $(node --version)"

if ! command -v pnpm &> /dev/null; then
  echo "   ⏳ Installing pnpm..."
  npm install -g pnpm 2>/dev/null || npm install -g pnpm --prefix=$HOME/.npm-global
fi
echo "   pnpm: $(pnpm --version)"
echo ""

# ─── 3. FFmpeg ────────────────────────────────────────────────
echo -e "${GREEN}[3/6]${NC} Checking FFmpeg..."
if command -v ffmpeg &> /dev/null; then
  echo "   FFmpeg: $(ffmpeg -version 2>&1 | head -1)"
else
  echo -e "${YELLOW}   ⚠️  Install FFmpeg...${NC}"
  sudo apt-get update -qq && sudo apt-get install -y -qq ffmpeg
  echo "   ✅ FFmpeg installed"
fi
echo ""

# ─── 4. Edge TTS (Python) ────────────────────────────────────
echo -e "${GREEN}[4/6]${NC} Checking Edge TTS..."
PYTHON_CMD=""
for cmd in python3 python; do
  if command -v $cmd &> /dev/null; then
    PYTHON_CMD=$cmd
    break
  fi
done

if [ -z "$PYTHON_CMD" ]; then
  echo -e "${YELLOW}   ⚠️  Install Python...${NC}"
  sudo apt-get update -qq && sudo apt-get install -y -qq python3 python3-pip
  PYTHON_CMD="python3"
fi

if $PYTHON_CMD -c "import edge_tts" 2>/dev/null; then
  echo "   Edge TTS: installed ($($PYTHON_CMD -m edge_tts --version 2>/dev/null || echo 'ok'))"
else
  echo "   ⏳ Installing edge-tts..."
  $PYTHON_CMD -m pip install edge-tts --break-system-packages -q 2>/dev/null || \
  $PYTHON_CMD -m pip install edge-tts -q
  echo "   ✅ Edge TTS installed"
fi
echo ""

# ─── 5. Install, Build & Copy .env ──────────────────────────
echo -e "${GREEN}[5/6]${NC} Installing dependencies & building..."

# Install dependencies
pnpm install
echo "   ✅ Dependencies installed"

# .env.local
if [ ! -f ".env.local" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env.local
  fi
fi

# Cek API Key
if [ -f ".env.local" ]; then
  KEY=$(grep "DEEPSEEK_API_KEY" .env.local | cut -d'=' -f2 | tr -d ' ')
  if [ -z "$KEY" ] || [ "$KEY" = "your_d..." ]; then
    echo -e "${YELLOW}   ⚠️  WARNING: DEEPSEEK_API_KEY belum diisi di .env.local${NC}"
    echo "        Isi dengan: nano .env.local"
  else
    echo "   ✅ DEEPSEEK_API_KEY: ${KEY:0:8}..."
  fi
fi

# Build
echo "   🔨 Building..."
pnpm build
echo "   ✅ Build complete"
echo ""

# ─── 6. PM2 + Services ──────────────────────────────────────
echo -e "${GREEN}[6/6]${NC} Starting services..."
echo ""

# Install PM2 kalau belum ada
if ! command -v pm2 &> /dev/null; then
  echo "   ⏳ Installing PM2..."
  npm install -g pm2 2>/dev/null || npm install -g pm2 --prefix=$HOME/.npm-global
fi
echo "   PM2: $(pm2 --version 2>/dev/null)"

# Pastikan log directory
mkdir -p "$APP_DIR/logs"

# Stop & restart app
pm2 delete exceltutor 2>/dev/null || true
PORT="$PORT" pm2 start ecosystem.config.cjs --update-env
pm2 save
echo "   ✅ App started on port $PORT"

# Cloudflare Tunnel (sudah terinstall sebagai service)
if systemctl is-active --quiet cloudflared 2>/dev/null; then
  echo "   ✅ Cloudflare Tunnel: active ($DOMAIN → localhost:$PORT)"
else
  echo -e "${YELLOW}   ⚠️  Cloudflare Tunnel tidak aktif. Setup manual:${NC}"
  echo "        sudo cloudflared service install"
  echo "        sudo systemctl start cloudflared"
fi

# Nginx (optional — kalau dipake)
if systemctl is-active --quiet nginx 2>/dev/null; then
  echo "   ✅ Nginx: active (port 80 → localhost:$PORT)"
fi

# ─── Selesai ─────────────────────────────────────────────────
echo ""
echo "============================================================"
echo -e "  ${GREEN}✅ Deploy selesai!${NC}"
echo ""
echo -e "  Local : http://localhost:${PORT}"
echo -e "  Web   : http://${DOMAIN}"
echo -e "  Log   : ${YELLOW}pm2 logs exceltutor${NC}"
echo ""
echo "  Useful commands:"
echo "    pm2 status              — cek status"
echo "    pm2 logs exceltutor     — lihat log"
echo "    pm2 restart exceltutor  — restart app"
echo "    bash deploy-gcp.sh      — update & redeploy"
echo "============================================================"
echo ""
