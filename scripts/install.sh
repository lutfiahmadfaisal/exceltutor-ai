#!/usr/bin/env bash
# ============================================================
# ExcelTutor AI — Install Dependencies
# ============================================================
set -e

echo "📦 ExcelTutor AI — Installing dependencies..."
echo ""

# 1. Node.js dependencies (pnpm)
echo "📦 [1/3] Installing Node.js packages..."
pnpm install
echo "   ✅ Node.js packages installed"
echo ""

# 2. Edge TTS (Python)
echo "🎤 [2/3] Installing Edge TTS..."
if command -v python3 &> /dev/null; then
  python3 -m pip install edge-tts 2>/dev/null || \
  pip3 install edge-tts 2>/dev/null || \
  echo "   ⚠️  pip install edge-tts gagal. Coba: pip install edge-tts"
  echo "   ✅ Edge TTS installed"
else
  echo "   ⚠️  Python3 tidak ditemukan. Edge TTS tidak bisa diinstall."
fi
echo ""

# 3. Buat direktori output
echo "📁 [3/3] Creating output directories..."
mkdir -p /tmp/exceltutor-output
mkdir -p /tmp/exceltutor-audio
echo "   ✅ Directories created (/tmp/exceltutor-output, /tmp/exceltutor-audio)"
echo ""

# 4. Copy .env kalau belum ada
if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
  echo "⚠️  .env.local dibuat dari .env.example. JANGAN LUPA isi DEEPSEEK_API_KEY!"
else
  echo "✅ .env.local already exists"
fi
echo ""

# 5. Verifikasi
echo "🔍 Verification:"
echo "   Node.js: $(node --version)"
echo "   pnpm:    $(pnpm --version 2>/dev/null || echo 'not found')"
echo "   FFmpeg:  $(ffmpeg -version 2>&1 | head -1 || echo 'not found')"
echo "   Edge TTS: $(python3 -m edge_tts --version 2>/dev/null || echo 'not installed')"
echo ""

echo "🎉 Installasi selesai!"
echo "   Jalankan: bash scripts/dev.sh"
