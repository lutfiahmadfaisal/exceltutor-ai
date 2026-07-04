// ============================================================
// ExcelTutor AI — Constants & App Configuration
// ============================================================

import type { AnimationSpeed, ExcelTheme } from '@/types';

/** Default application configuration */
export const APP_CONFIG = {
  // Video export
  video: {
    width: 1280,
    height: 720,
    fps: 30,
    codec: 'libx264',
    audioBitrate: '128k',
    preset: 'medium',
    crf: 23,
    outputDir: '/tmp/exceltutor-output',
  },

  // TTS
  tts: {
    defaultVoice: 'id-ID-ArdiNeural',
    altVoice: 'id-ID-GadisNeural',
    language: 'id-ID',
    outputDir: '/tmp/exceltutor-audio',
  },

  // LLM
  llm: {
    defaultModel: 'deepseek-chat',
    apiBaseUrl: 'https://api.deepseek.com/v1',
    maxTokens: 8192,
    temperature: 0.3,
  },

  // Default columns for empty template
  defaultColumns: [
    { id: 'A', name: 'A', width: 10 },
    { id: 'B', name: 'B', width: 10 },
    { id: 'C', name: 'C', width: 10 },
  ],
} as const;

/** Animation speed presets (ms) */
export const ANIMATION_SPEEDS: Record<AnimationSpeed, {
  cursorMove: number;
  typeDelay: number;
  highlightFade: number;
  stepGap: number;
}> = {
  slow:   { cursorMove: 800, typeDelay: 150, highlightFade: 600, stepGap: 2000 },
  normal: { cursorMove: 400, typeDelay: 80,  highlightFade: 400, stepGap: 1000 },
  fast:   { cursorMove: 200, typeDelay: 40,  highlightFade: 200, stepGap: 500 },
};

/** Color palette for highlights */
export const HIGHLIGHT_COLORS: Record<string, string> = {
  yellow: 'rgba(255, 255, 0, 0.35)',
  blue:   'rgba(66, 133, 244, 0.25)',
  green:  'rgba(52, 168, 83, 0.25)',
  orange: 'rgba(251, 188, 4, 0.30)',
};

/** Excel theme colors */
export const EXCEL_THEMES: Record<ExcelTheme, {
  gridBg: string;
  headerBg: string;
  cellColor: string;
  borderColor: string;
  formulaBg: string;
  ribbonBg: string;
  cursorColor: string;
}> = {
  classic: {
    gridBg: '#FFFFFF',
    headerBg: '#F1F3F4',
    cellColor: '#000000',
    borderColor: '#DADCE0',
    formulaBg: '#FFFFFF',
    ribbonBg: '#217346',
    cursorColor: '#217346',
  },
  dark: {
    gridBg: '#1E1E1E',
    headerBg: '#2D2D2D',
    cellColor: '#E0E0E0',
    borderColor: '#444444',
    formulaBg: '#2D2D2D',
    ribbonBg: '#107C41',
    cursorColor: '#4CAF50',
  },
  modern: {
    gridBg: '#FAFBFC',
    headerBg: '#E8EAED',
    cellColor: '#202124',
    borderColor: '#C4C7CC',
    formulaBg: '#FFFFFF',
    ribbonBg: '#1A73E8',
    cursorColor: '#1A73E8',
  },
};

/** Status labels for UI */
export const STATUS_LABELS: Record<string, string> = {
  idle: 'Siap menunggu prompt',
  generating: 'Menganalisis topik...',
  generated: 'Step tutorial siap',
  'generating-audio': 'Menghasilkan audio narasi...',
  ready: 'Siap diputar',
  recording: 'Merekam video...',
  exporting: 'Mengkonversi ke MP4...',
  error: 'Terjadi kesalahan',
};

/** Error messages */
export const ERROR_MESSAGES: Record<string, string> = {
  LLM_ERROR: 'Gagal memproses prompt. Coba dengan topik yang lebih spesifik.',
  TTS_ERROR: 'Gagal menghasilkan audio. Pastikan Edge TTS terinstall dengan benar.',
  EXPORT_ERROR: 'Gagal mengekspor video. Coba refresh halaman.',
  NETWORK_ERROR: 'Koneksi bermasalah. Periksa koneksi internet Anda.',
  NO_STEPS: 'Tidak ada step yang dihasilkan. Coba prompt yang berbeda.',
  EMPTY_PROMPT: 'Masukkan topik tutorial terlebih dahulu.',
};

/** PM2 / Start script names */
export const SERVICE_NAMES = {
  dev: 'exceltutor-dev',
  prod: 'exceltutor-prod',
} as const;

/** Default port */
export const DEFAULT_PORT = 3000;
