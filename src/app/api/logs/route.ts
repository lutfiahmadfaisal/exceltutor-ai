// ============================================================
// API: GET /api/logs — Read application logs
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');
  const tail = parseInt(searchParams.get('tail') || '0', 10);
  const filter = searchParams.get('filter');

  let text: string;

  if (file) {
    text = logger.readFile(file);
    if (!text) {
      return NextResponse.json({ error: 'Log file not found' }, { status: 404 });
    }
  } else {
    text = logger.read();
  }

  let lines = text.trim().split('\n').filter(Boolean);

  // Filter by level
  if (filter) {
    const f = filter.toUpperCase();
    lines = lines.filter((l) => l.includes(` ${f} `));
  }

  // Tail
  if (tail > 0) {
    lines = lines.slice(-tail);
  }

  const files = logger.listFiles();

  return NextResponse.json({
    logs: lines,
    count: lines.length,
    files,
    currentFile: file || `app-${new Date().toISOString().slice(0, 10)}.log`,
  });
}
