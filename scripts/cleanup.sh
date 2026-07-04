#!/usr/bin/env bash
# ============================================================
# ExcelTutor AI — Cleanup script
# Hapus file output yang lebih dari 1 jam
# ============================================================
echo "🧹 Cleaning up old output files..."
find /tmp/exceltutor-output -type f -mmin +60 -delete 2>/dev/null && echo "   ✅ Video cache cleaned" || echo "   ⚠️  No video cache found"
find /tmp/exceltutor-audio -type f -mmin +60 -delete 2>/dev/null && echo "   ✅ Audio cache cleaned" || echo "   ⚠️  No audio cache found"
echo "Done."
