// ============================================================
// ExcelTutor AI — Next.js Configuration
// ============================================================

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow development access via tunnel (localhost.run, ngrok, etc.)
  allowedDevOrigins: [
    'sunsinsue.my.id',
    '816b2c00d871ed.lhr.life',
    '*.lhr.life',
    '*.localhost.run',
    '*.serveo.net',
    '*.ngrok-free.app',
    '*.ngrok.io',
  ],

  // Don't run React strict mode twice to avoid double renders
  reactStrictMode: false,
};

module.exports = nextConfig;
