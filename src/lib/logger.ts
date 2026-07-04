// ============================================================
// ExcelTutor AI — File Logger
// ============================================================

import fs from 'fs';
import path from 'path';
import os from 'os';

const LOG_DIR = path.join(process.cwd(), 'logs');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function getLogFile(): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(LOG_DIR, `app-${date}.log`);
}

function formatMsg(level: string, source: string, msg: string, data?: unknown): string {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 23);
  let line = `[${ts}] ${level.padEnd(6)} ${source}`;
  if (data !== undefined) {
    try {
      const extra = typeof data === 'object' ? JSON.stringify(data) : String(data);
      line += ` ${msg} | ${extra}`;
    } catch {
      line += ` ${msg} | [unserializable]`;
    }
  } else {
    line += ` ${msg}`;
  }
  return line;
}

function writeLog(level: string, source: string, msg: string, data?: unknown) {
  ensureLogDir();
  const line = formatMsg(level, source, msg, data);
  const file = getLogFile();
  try {
    fs.appendFileSync(file, line + '\n', 'utf-8');
  } catch {
    // Jika gagal tulis file, fallback ke console
    console.error('[logger] Failed to write to', file);
  }
}

export const logger = {
  info(source: string, msg: string, data?: unknown) {
    writeLog('INFO', source, msg, data);
    console.log(`[${source}]`, msg, data ?? '');
  },

  warn(source: string, msg: string, data?: unknown) {
    writeLog('WARN', source, msg, data);
    console.warn(`[${source}]`, msg, data ?? '');
  },

  error(source: string, msg: string, data?: unknown) {
    writeLog('ERROR', source, msg, data);
    console.error(`[${source}]`, msg, data ?? '');
  },

  debug(source: string, msg: string, data?: unknown) {
    if (process.env.NODE_ENV === 'development') {
      writeLog('DEBUG', source, msg, data);
      console.log(`[${source}]`, msg, data ?? '');
    }
  },

  /** Baca semua log hari ini */
  read(): string {
    const file = getLogFile();
    if (!fs.existsSync(file)) return '';
    return fs.readFileSync(file, 'utf-8');
  },

  /** List semua file log yang tersedia */
  listFiles(): string[] {
    if (!fs.existsSync(LOG_DIR)) return [];
    return fs.readdirSync(LOG_DIR)
      .filter(f => f.startsWith('app-') && f.endsWith('.log'))
      .sort()
      .reverse();
  },

  /** Baca file log tertentu */
  readFile(filename: string): string {
    if (filename.includes('..') || filename.includes('/')) return '';
    const file = path.join(LOG_DIR, filename);
    if (!fs.existsSync(file)) return '';
    return fs.readFileSync(file, 'utf-8');
  },

  LOG_DIR,
};
