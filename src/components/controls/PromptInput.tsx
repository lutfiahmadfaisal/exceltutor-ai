// ============================================================
// ExcelTutor AI — Prompt Input & Template Selector
// ============================================================

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useExcelStore } from '@/store/excel-store';
import { getAllTemplates, getTemplateById } from '@/config/excel-templates';
import type { ExcelTemplate } from '@/types';

const templates = getAllTemplates();

interface PromptInputProps {
  onStepsGenerated?: () => void;
}

export default function PromptInput({ onStepsGenerated }: PromptInputProps) {
  const [localPrompt, setLocalPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const prompt = useExcelStore((s) => s.prompt);
  const selectedTemplateId = useExcelStore((s) => s.selectedTemplateId);
  const setPrompt = useExcelStore((s) => s.setPrompt);
  const setSelectedTemplate = useExcelStore((s) => s.setSelectedTemplate);
  const applyTemplate = useExcelStore((s) => s.applyTemplate);
  const setSteps = useExcelStore((s) => s.setSteps);
  const setStatus = useExcelStore((s) => s.setStatus);
  const setError = useExcelStore((s) => s.setError);

  /** Handle template selection */
  const handleTemplateChange = useCallback(
    (id: string) => {
      setSelectedTemplate(id);
      const template = getTemplateById(id);
      if (template) {
        applyTemplate(template);
        // Set example prompt
        if (!localPrompt) {
          setLocalPrompt(template.examplePrompt);
        }
      } else if (id === 'custom') {
        setExcelConfig(getEmptyTemplate());
      }
    },
    [setSelectedTemplate, applyTemplate, localPrompt]
  );

  /** Generate steps dari DeepSeek */
  const handleGenerate = useCallback(async () => {
    const text = localPrompt.trim();
    if (!text) {
      setErrorMsg('Masukkan topik tutorial terlebih dahulu');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setStatus('generating');

    try {
      // Panggil API route sendiri (server-side, process.env aman)
      const res = await fetch('/api/generate-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          templateId: selectedTemplateId !== 'custom' ? selectedTemplateId : undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const { steps } = await res.json();
      setSteps(steps);
      setPrompt(text);
      onStepsGenerated?.();

      // Generate TTS audio untuk semua step
      setStatus('generating-audio');
      try {
        const audioRes = await fetch('/api/generate-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ steps }),
        });
        if (audioRes.ok) {
          const { audioUrls, durations } = await audioRes.json();
          useExcelStore.getState().setAudioUrls(audioUrls, durations);
        } else {
          // Audio gagal tapi step tetap bisa dipakai tanpa audio
          console.warn('[PromptInput] Audio generation gagal, lanjut tanpa audio');
          useExcelStore.getState().setAudioUrls([], []);
        }
      } catch (audioErr: any) {
        console.warn('[PromptInput] Audio error:', audioErr);
        useExcelStore.getState().setAudioUrls([], []);
      }
    } catch (err: any) {
      const msg = err.message || 'Gagal menghasilkan tutorial. Coba lagi.';
      setErrorMsg(msg);
      setError({ code: 'LLM_ERROR', message: msg });
    } finally {
      setIsGenerating(false);
    }
  }, [localPrompt, selectedTemplateId, setSteps, setPrompt, setStatus, setError, onStepsGenerated]);

  useEffect(() => { setMounted(true); }, []);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #DADCE0',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "'Segoe UI', sans-serif",
    outline: 'none',
    resize: 'vertical',
    minHeight: 60,
    transition: 'border-color 0.15s',
  };

  const inputFocusedStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: '#217346',
  };

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #DADCE0',
    borderRadius: 6,
    fontSize: 13,
    fontFamily: "'Segoe UI', sans-serif",
    cursor: 'pointer',
    minWidth: 200,
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 24px',
    background: isGenerating ? '#9AA0A6' : '#217346',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: isGenerating ? 'not-allowed' : 'pointer',
    fontFamily: "'Segoe UI', sans-serif",
    transition: 'all 0.15s',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 20,
        background: '#FFFFFF',
        borderRadius: 8,
        border: '1px solid #DADCE0',
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 600,
          color: '#202124',
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        Buat Tutorial Excel
      </h3>

      {/* Template selector */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label
          style={{
            fontSize: 13,
            color: '#5F6368',
            fontFamily: "'Segoe UI', sans-serif",
            fontWeight: 500,
          }}
        >
          Template Data:
        </label>
        <select
          style={selectStyle}
          value={selectedTemplateId}
          onChange={(e) => handleTemplateChange(e.target.value)}
        >
          {templates.map((t: ExcelTemplate) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {selectedTemplateId !== 'custom' && (
          <span
            style={{
              fontSize: 11,
              color: '#5F6368',
              fontFamily: "'Segoe UI', sans-serif",
            }}
          >
            (Data akan terisi otomatis)
          </span>
        )}
      </div>

      {/* Prompt textarea */}
      <textarea
        placeholder="Contoh: Jelaskan cara menggunakan VLOOKUP untuk mencari harga produk..."
        value={localPrompt}
        onChange={(e) => {
          setLocalPrompt(e.target.value);
          setErrorMsg(null);
        }}
        style={localPrompt ? inputFocusedStyle : inputStyle}
        onFocus={(e) => {
          e.target.style.borderColor = '#217346';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#DADCE0';
        }}
        rows={3}
      />

      {/* Error message */}
      {errorMsg && (
        <div
          style={{
            padding: '8px 12px',
            background: '#FCE8E6',
            borderRadius: 6,
            fontSize: 13,
            color: '#C5221F',
            fontFamily: "'Segoe UI', sans-serif",
          }}
        >
          ❌ {errorMsg}
        </div>
      )}

      {/* Generate button */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          style={buttonStyle}
          onClick={handleGenerate}
          disabled={!mounted || isGenerating || !localPrompt.trim()}
          onMouseEnter={(e) => {
            if (!isGenerating) e.currentTarget.style.background = '#1E6B3A';
          }}
          onMouseLeave={(e) => {
            if (!isGenerating) e.currentTarget.style.background = '#217346';
          }}
        >
          {!mounted ? '🚀 Generate Tutorial' : isGenerating ? '⏳ Menggenerasi...' : '🚀 Generate Tutorial'}
        </button>

        {/* Example prompts */}
        {selectedTemplateId !== 'custom' && (
          <span
            style={{
              fontSize: 11,
              color: '#5F6368',
              fontFamily: "'Segoe UI', sans-serif",
            }}
          >
            Tips: Prompt di atas sudah disesuaikan dengan template
          </span>
        )}
      </div>
    </div>
  );
}

function getEmptyTemplate(): import('@/types').ExcelConfig {
  return {
    columns: [{ id: 'A', name: 'A', width: 12 }, { id: 'B', name: 'B', width: 12 }, { id: 'C', name: 'C', width: 12 }],
    initialData: {},
    sheetName: 'Sheet1',
  };
}

function setExcelConfig(config: import('@/types').ExcelConfig) {
  useExcelStore.getState().setExcelConfig(config);
}
