// ============================================================
// ExcelTutor AI — PM2 Ecosystem Configuration
// ============================================================
// Digunakan untuk manage process via PM2.
// Start: pm2 start ecosystem.config.cjs
// ============================================================

module.exports = {
  apps: [
    {
      name: 'exceltutor',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      // Auto-restart kalau crash
      instances: 1,
      exec_mode: 'fork',
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      merge_logs: true,
      // Restart behavior
      max_restarts: 10,
      restart_delay: 5000,
      // Graceful shutdown
      kill_timeout: 5000,
      // Health monitoring
      max_memory_restart: '500M',
    },
  ],
};
