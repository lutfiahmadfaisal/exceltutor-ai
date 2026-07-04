// ============================================================
// API: POST /api/convert-mp4 — Convert WebM to MP4 via FFmpeg
// API: GET /api/video/:filename — Serve video files
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { convertWebmToMp4 } from '@/lib/video-export/export';
import { logger } from '@/lib/logger';

/**
 * POST — Terima WebM upload, convert ke MP4
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File | null;

    if (!videoFile) {
      return NextResponse.json(
        { error: 'File video diperlukan' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check size (max 100MB)
    if (buffer.length > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File terlalu besar. Maksimum 100MB.' },
        { status: 413 }
      );
    }

    logger.info('convert-mp4', 'Converting video', { sizeBytes: buffer.length, name: videoFile.name });
    const result = await convertWebmToMp4(buffer, videoFile.name.replace('.webm', ''));
    logger.info('convert-mp4', 'Conversion done', result);

    return NextResponse.json(result);
  } catch (err: any) {
    logger.error('convert-mp4', err.message || 'Conversion error');

    if (err.message?.includes('ffmpeg')) {
      return NextResponse.json(
        { error: 'FFmpeg conversion gagal. Pastikan ffmpeg terinstall.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: err.message || 'Gagal konversi video' },
      { status: 500 }
    );
  }
}
