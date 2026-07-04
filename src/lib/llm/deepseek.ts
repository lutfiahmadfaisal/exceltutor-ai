// ============================================================
// ExcelTutor AI — DeepSeek LLM Integration
// ============================================================

import type { SimStep } from '@/types';
import { APP_CONFIG } from '@/config/constants';
import { getTemplateById } from '@/config/excel-templates';

/**
 * System prompt untuk DeepSeek.
 * Output harus valid JSON object dengan key "steps".
 */
function buildSystemPrompt(templateId?: string, stepCount = 12): string {
  const template = templateId ? getTemplateById(templateId) : null;

  const templateContext = template
    ? `\nData spreadsheet yang tersedia:\n` +
      `Kolom: ${template.columns.map((c) => `${c.id}: ${c.name}`).join(', ')}\n` +
      `Data awal:\n${Object.entries(template.initialData)
        .map(([cell, val]) => `  ${cell}: ${val}`)
        .join('\n')}\n` +
      `Petunjuk: ${template.systemHint}`
    : '\nBuat data sendiri yang relevan dengan topik tutorial.';

  return `You are an Excel tutorial script generator in Bahasa Indonesia.
Buat tutorial Excel untuk pemula total.
Setiap langkah harus dijelaskan dengan jelas.

${templateContext}

Return ONLY valid JSON object with format:
{ "steps": [ ... ] }

Setiap step dalam array WAJIB memiliki semua field berikut:
{
  "stepNumber": number,
  "title": string,
  "narration": string,
  "cellActions": [
    {
      "type": "highlight" | "type" | "select" | "moveCursor",
      "targetCell": string,
      "value": string,
      "highlightColor": "yellow" | "blue" | "green" | "orange"
    }
  ],
  "formulaBar": {
    "cellName": string,
    "formula": string,
    "isActive": boolean
  },
  "tooltip": {
    "targetCell": string,
    "text": string
  }
}

PENTING:
- BUAT TEPAT ${stepCount} STEP (jangan lebih!)
- narration: 1-2 kalimat singkat dalam SATU BARIS, jelaskan APA yang dilakukan dan MENGAPA
- cellActions maksimal 3 per step
- Setiap step HARUS memiliki setidaknya 1 cellAction
- JANGAN gunakan string multi-line di dalam JSON
- title: jelaskan spesifik apa yang dilakukan, misal "Ketik rumus SUM di sel C6" bukan "Mengetik rumus"
- Return ONLY valid JSON. No explanation.`;
}

/**
 * Coba repair JSON yang terpotong (truncated).
 * Tutup semua bracket/kurung yang masih terbuka.
 */
function repairTruncatedJson(text: string): string {
  let result = text.trim();

  // Hapus trailing koma sebelum menutup bracket
  result = result.replace(/,\s*$/, '');

  // Hitung bracket yang perlu ditutup
  let openBrackets = 0;
  let openBraces = 0;
  let inString = false;
  let escapeNext = false;

  for (const char of result) {
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (char === '[') openBrackets++;
    if (char === ']') openBrackets--;
    if (char === '{') openBraces++;
    if (char === '}') openBraces--;
  }

  // Jika sedang di dalam string, tutup string dulu
  if (inString) {
    result += '"';
  }

  // Hapus trailing koma lagi (mungkin ada setelah string ditutup)
  result = result.replace(/,\s*$/, '');

  // Tutup bracket/kurung yang terbuka (urutan terbalik)
  for (let i = 0; i < openBraces; i++) result += '}';
  for (let i = 0; i < openBrackets; i++) result += ']';

  return result;
}

/**
 * Panggil DeepSeek API untuk generate tutorial steps.
 */
export async function generateSteps(
  prompt: string,
  templateId?: string
): Promise<SimStep[]> {
  // Coba dengan 6 step dulu, kalau gagal retry dengan 4 step
  const attempts = [12, 8];

  for (const stepCount of attempts) {
    try {
      return await callDeepSeek(prompt, templateId, stepCount);
    } catch (err: any) {
      // Kalau error karena JSON terpotong dan masih ada attempt lain, retry
      if (err.message?.includes('terpotong') || err.message?.includes('JSON')) {
        if (stepCount === attempts[attempts.length - 1]) {
          throw err; // Sudah attempt terakhir, throw
        }
        console.warn(`[deepseek] Retry dengan ${stepCount - 2} step...`);
        continue;
      }
      throw err;
    }
  }

  throw new Error('Gagal generate tutorial');
}

async function callDeepSeek(
  prompt: string,
  templateId: string | undefined,
  stepCount: number
): Promise<SimStep[]> {
  const systemPrompt = buildSystemPrompt(templateId, stepCount);

  const response = await fetch(`${APP_CONFIG.llm.apiBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: APP_CONFIG.llm.defaultModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Topik: ${prompt}\n\nGenerate langkah-langkah tutorial Excel.` },
      ],
      max_tokens: APP_CONFIG.llm.maxTokens,
      temperature: APP_CONFIG.llm.temperature,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      `DeepSeek API error: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ''}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  const finishReason = data.choices?.[0]?.finish_reason;

  if (!content) {
    throw new Error('DeepSeek returned empty response');
  }

  // Extract JSON dari response
  const jsonStr = extractJson(content);

  // Coba parse langsung dulu
  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // Kalau gagal, coba repair JSON yang terpotong
    if (finishReason === 'length') {
      console.warn('[deepseek] Response terpotong (finish_reason=length), mencoba repair JSON...');
      const repaired = repairTruncatedJson(jsonStr);
      try {
        parsed = JSON.parse(repaired);
      } catch (repairErr: any) {
        throw new Error(
          `Response LLM terpotong dan tidak bisa di-repair. Coba topik yang lebih sederhana. Detail: ${repairErr.message}`
        );
      }
    } else {
      throw new Error(
        `Format JSON dari LLM tidak valid. Coba lagi atau gunakan topik yang berbeda.`
      );
    }
  }

  // Support format: array langsung ATAU { "steps": [...] }
  const stepsArray = Array.isArray(parsed) ? parsed : parsed.steps;

  if (!Array.isArray(stepsArray)) {
    throw new Error('DeepSeek did not return a valid steps array');
  }

  // Validate & normalize
  const steps: SimStep[] = stepsArray.map((step: any, i: number) => ({
    stepNumber: step.stepNumber || i + 1,
    title: step.title || `Step ${i + 1}`,
    narration: step.narration || '',
    duration: step.duration || 3000,
    cellActions: (step.cellActions || []).map((action: any) => ({
      type: action.type || 'select',
      targetCell: action.targetCell || 'A1',
      value: action.value,
      highlightColor: action.highlightColor,
      delay: action.delay || 0,
    })),
    formulaBar: {
      cellName: step.formulaBar?.cellName || '',
      formula: step.formulaBar?.formula || '',
      isActive: step.formulaBar?.isActive || false,
    },
    tooltip: step.tooltip
      ? {
          targetCell: step.tooltip.targetCell || '',
          text: step.tooltip.text || '',
        }
      : undefined,
  }));

  return steps;
}

/**
 * Extract JSON string from LLM response (strip markdown code blocks).
 */
function extractJson(text: string): string {
  // Coba parse langsung dulu
  try {
    JSON.parse(text);
    return text;
  } catch {
    // Cari di dalam ```json ... ``` block
    const jsonBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonBlockMatch) {
      return jsonBlockMatch[1].trim();
    }
    // Cari object JSON ({...}) di text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return objectMatch[0];
    }
    // Cari array JSON ([...]) di text
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return arrayMatch[0];
    }
    throw new Error('No valid JSON found in LLM response');
  }
}
