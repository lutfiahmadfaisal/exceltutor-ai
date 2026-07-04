// ============================================================
// ExcelTutor AI — Video Export Service
// ============================================================

import { APP_CONFIG } from '@/config/constants';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

export interface ExportResult {
  mp4Url: string;
  filename: string;
  sizeBytes: number;
  durationMs: number;
}

function getOutputDir(): string {
  return path.join(os.tmpdir(), 'exceltutor-output');
}

/**
 * Convert WebM blob (from MediaRecorder) ke MP4 via FFmpeg CLI.
 * Dipanggil dari API route.
 */
export async function convertWebmToMp4(
  webmBuffer: Buffer,
  filename?: string
): Promise<ExportResult> {
  const outputDir = getOutputDir();

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = Date.now();
  const baseName = filename || `tutorial-${timestamp}`;
  const webmPath = path.join(outputDir, `${baseName}.webm`);
  const mp4Path = path.join(outputDir, `${baseName}.mp4`);

  // Simpan WebM sementara
  fs.writeFileSync(webmPath, webmBuffer);

  // Convert via FFmpeg
  const { codec, preset, crf, audioBitrate } = APP_CONFIG.video;
  const cmd = `ffmpeg -y -i "${webmPath}" -c:v ${codec} -preset ${preset} -crf ${crf} -c:a aac -b:a ${audioBitrate} "${mp4Path}"`;

  try {
    execSync(cmd, { timeout: 120000, stdio: 'pipe' });
  } catch (err: any) {
    // Hapus file sisa kalau gagal
    if (fs.existsSync(webmPath)) fs.unlinkSync(webmPath);
    throw new Error(`FFmpeg conversion failed: ${err.message}`);
  }

  // Hapus WebM (udah gak perlu)
  if (fs.existsSync(webmPath)) fs.unlinkSync(webmPath);

  const stats = fs.statSync(mp4Path);
  const durationMs = await getVideoDuration(mp4Path);

  return {
    mp4Url: `/api/video/${baseName}.mp4`,
    filename: `${baseName}.mp4`,
    sizeBytes: stats.size,
    durationMs,
  };
}

/**
 * Dapatkan durasi video via ffprobe.
 */
function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    exec(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
      { timeout: 5000 },
      (err: any, stdout: string) => {
        if (err || !stdout) {
          resolve(0);
          return;
        }
        const seconds = parseFloat(stdout.trim());
        resolve(Math.round(seconds * 1000));
      }
    );
  });
}

/**
 * Hapus file output lama (cleanup).
 */
export function cleanupOldFiles(maxAgeMs: number = 3600000) {
  const dirs = [getOutputDir(), path.join(os.tmpdir(), 'exceltutor-audio')];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    const now = Date.now();
    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (now - stat.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filePath);
        }
      } catch {
        // skip file errors
      }
    }
  }
}

/**
 * Client-side: setup MediaRecorder dari HTMLCanvasElement.
 */
export function setupMediaRecorder(
  canvas: HTMLCanvasElement,
  options: {
    fps?: number;
    onDataAvailable?: (chunk: Blob) => void;
    onStop?: (blob: Blob) => void;
    onError?: (err: Error) => void;
  } = {}
): MediaRecorder | null {
  const fps = options.fps || APP_CONFIG.video.fps;
  const canvasStream = canvas.captureStream(fps);

  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/webm',
  ];

  let mimeType = '';
  for (const mt of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mt)) {
      mimeType = mt;
      break;
    }
  }

  if (!mimeType) {
    options.onError?.(new Error('No supported video mime type found'));
    return null;
  }

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(canvasStream, { mimeType });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
      options.onDataAvailable?.(e.data);
    }
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    options.onStop?.(blob);
  };

  recorder.onerror = () => {
    options.onError?.(new Error('MediaRecorder error'));
  };

  return recorder;
}
