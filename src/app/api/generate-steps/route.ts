// ============================================================
// API: POST /api/generate-steps — Generate tutorial steps via DeepSeek
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateSteps } from '@/lib/llm/deepseek';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, templateId } = body;
    logger.info('generate-steps', 'Request received', { prompt: prompt?.slice(0, 80), templateId });

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt tidak boleh kosong' },
        { status: 400 }
      );
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'DEEPSEEK_API_KEY belum dikonfigurasi. Tambahkan di .env.local' },
        { status: 500 }
      );
    }

    const steps = await generateSteps(prompt.trim(), templateId);
    logger.info('generate-steps', 'Steps generated', { count: steps.length, titles: steps.map(s => s.title).slice(0, 3) });

    if (!steps || steps.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada step yang dihasilkan. Coba prompt yang berbeda.' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      steps,
      templateUsed: templateId || 'custom',
      prompt: prompt.trim(),
    });
  } catch (err: any) {
    logger.error('generate-steps', err.message || 'Unknown error', { prompt: '[redacted]' });

    // DeepSeek specific errors
    if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'API Key tidak valid. Periksa DEEPSEEK_API_KEY di .env.local' },
        { status: 401 }
      );
    }

    if (err.message?.includes('429') || err.message?.includes('Rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit DeepSeek API. Tunggu beberapa saat lalu coba lagi.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: err.message || 'Gagal generate tutorial' },
      { status: 500 }
    );
  }
}
