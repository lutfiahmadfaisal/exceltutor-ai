#!/usr/bin/env bash
# ============================================================
# ExcelTutor AI — PM2 Ecosystem Config
# ============================================================

# PM2 process name
NAME="exceltutor"

echo "📋 PM2 commands for ExcelTutor AI:"
echo ""
echo "   Start:    pm2 start ecosystem.config.cjs --env production"
echo "   Stop:     pm2 stop $NAME"
echo "   Restart:  pm2 restart $NAME"
echo "   Logs:     pm2 logs $NAME"
echo "   Status:   pm2 status"
echo "   Monitor:  pm2 monit"
echo ""
echo "   Dev mode: pm2 start ecosystem.config.cjs --env development"
echo ""
