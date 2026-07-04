// ============================================================
// ExcelTutor AI — Video Export (Client-side)
// MediaRecorder setup — NO Node.js modules, safe for browser
// ============================================================

import { APP_CONFIG } from '@/config/constants';

export interface ClientRecorderOptions {
  fps?: number;
  onDataAvailable?: (chunk: Blob) => void;
  onStop?: (blob: Blob) => void;
  onError?: (err: Error) => void;
}

/**
 * Setup MediaRecorder dari HTMLCanvasElement.
 * Returns: MediaRecorder instance (belum di-start)
 */
export function setupMediaRecorder(
  canvas: HTMLCanvasElement,
  options: ClientRecorderOptions = {}
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
    // Wrap async onStop — jika return Promise, tangkap error-nya
    const result = options.onStop?.(blob);
    if (result instanceof Promise) {
      result.catch((err) => {
        options.onError?.(err instanceof Error ? err : new Error(String(err)));
      });
    }
  };

  recorder.onerror = () => {
    options.onError?.(new Error('MediaRecorder error'));
  };

  return recorder;
}
