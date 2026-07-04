// ============================================================
// API: POST /api/generate-audio — Generate audio via Edge TTS
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateAllAudio } from '@/lib/tts/edge-tts';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { steps } = body;
    logger.info('generate-audio', 'Request received', { stepCount: steps?.length });

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json(
        { error: 'Steps array diperlukan' },
        { status: 400 }
      );
    }

    // Extract narration texts
    const narrations = steps.map((s: any) => s.narration || '');

    // Generate audio
    const result = await generateAllAudio(narrations);

    // Return file paths — client will fetch these via /api/audio/*
    logger.info('generate-audio', 'Audio generated', { urls: result.audioUrls.length, totalDurationMs: result.durations.reduce((a,b) => a+b, 0) });
    return NextResponse.json({
      audioUrls: result.audioUrls.map((_p, i) => `/api/audio/step-${String(i).padStart(3, '0')}.mp3`),
      durations: result.durations,
    });
  } catch (err: any) {
    logger.error('generate-audio', err.message || 'TTS error');

    if (err.message?.includes('edge_tts')) {
      return NextResponse.json(
        {
          error: 'Edge TTS tidak terinstall. Jalankan: pip install edge-tts',
          details: err.message,
        },
        { status: 500 }
      );
    }

    // Return partial success: steps without audio
    return NextResponse.json(
      {
        error: err.message || 'Gagal generate audio',
        audioUrls: [],
        durations: [],
      },
      { status: 500 }
    );
  }
}
