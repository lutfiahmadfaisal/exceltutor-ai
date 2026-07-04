// ============================================================
// ExcelTutor AI — Edge TTS Service
// ============================================================

import { APP_CONFIG } from '@/config/constants';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync, exec } from 'child_process';

/**
 * Generate audio dari narration text menggunakan Edge TTS (Python).
 * Output: file MP3 di outputDir.
 * Returns: { filePath, durationMs }
 */
export async function generateAudio(
  text: string,
  index: number,
  voice: string = APP_CONFIG.tts.defaultVoice
): Promise<{ filePath: string; durationMs: number }> {
  const outputDir = path.join(os.tmpdir(), 'exceltutor-audio');
  const filename = `step-${String(index).padStart(3, '0')}.mp3`;
  const filePath = path.join(outputDir, filename);

  // Pastikan direktori ada
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Panggil edge-tts Python CLI
  // Format: edge-tts --voice id-ID-ArdiNeural --text "..." --write-media output.mp3
  const escapedText = text
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
    .trim();

  if (!escapedText) {
    // Skip — narration kosong
    return { filePath, durationMs: 500 };
  }

  // Deteksi perintah Python yang tersedia (python3 di Linux/Mac, python di Windows)
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  const cmd = `${pythonCmd} -m edge_tts --voice "${voice}" --text "${escapedText}" --write-media "${filePath}"`;

  try {
    execSync(cmd, { timeout: 30000, stdio: 'pipe' });
  } catch (err: any) {
    // Fallback: coba edge-tts sebagai executable langsung
    try {
      const fallbackCmd = `edge-tts --voice "${voice}" --text "${escapedText}" --write-media "${filePath}"`;
      execSync(fallbackCmd, { timeout: 30000, stdio: 'pipe' });
    } catch (err2: any) {
      throw new Error(
        `Edge TTS failed: ${err2.message || err.message}. ` +
        `Install with: pip install edge-tts`
      );
    }
  }

  // Dapatkan duration dari file audio via ffprobe
  const durationMs = await getAudioDuration(filePath);

  return { filePath, durationMs };
}

/**
 * Generate audio untuk semua steps sekaligus.
 * Returns: array of { url, durationMs }
 */
export async function generateAllAudio(
  narrations: string[]
): Promise<{ audioUrls: string[]; durations: number[] }> {
  const results = await Promise.all(
    narrations.map((text, i) => generateAudio(text, i))
  );

  return {
    audioUrls: results.map((r) => r.filePath),
    durations: results.map((r) => r.durationMs),
  };
}

/**
 * Dapatkan durasi file audio dalam ms menggunakan ffprobe.
 */
function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve) => {
    exec(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
      { timeout: 5000 },
      (err, stdout) => {
        if (err || !stdout) {
          // Fallback: estimate panjang audio (karakter * 80ms)
          const stats = fs.statSync(filePath);
          const estimatedMs = Math.max(500, Math.round(stats.size / 1600 * 1000));
          resolve(estimatedMs);
          return;
        }
        const seconds = parseFloat(stdout.trim());
        const ms = Math.round(seconds * 1000);
        resolve(Math.max(500, ms));
      }
    );
  });
}
