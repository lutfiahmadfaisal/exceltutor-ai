// ============================================================
// ExcelTutor AI — Playback Controls
// ============================================================

'use client';

import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { useExcelStore } from '@/store/excel-store';
import { setupMediaRecorder } from '@/lib/video-export/client-export';

interface PlaybackControlsProps {
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export default function PlaybackControls({ canvasRef }: PlaybackControlsProps) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>('tutorial.webm');
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const steps = useExcelStore((s) => s.steps);
  const currentStepIndex = useExcelStore((s) => s.currentStepIndex);
  const isPlaying = useExcelStore((s) => s.isPlaying);
  const speed = useExcelStore((s) => s.speed);
  const status = useExcelStore((s) => s.status);
  const isRecording = useExcelStore((s) => s.isRecording);

  const totalSteps = steps.length;
  const progress = useMemo(() => {
    if (steps.length === 0) return 0;
    return Math.round(((currentStepIndex + 1) / steps.length) * 100);
  }, [steps.length, currentStepIndex]);

  const togglePlay = useExcelStore((s) => s.setIsPlaying);
  const prevStep = useExcelStore((s) => s.prevStep);
  const nextStep = useExcelStore((s) => s.nextStep);
  const setSpeed = useExcelStore((s) => s.setSpeed);
  const setTheme = useExcelStore((s) => s.setTheme);
  const setIsRecording = useExcelStore((s) => s.setIsRecording);
  const setExportProgress = useExcelStore((s) => s.setExportProgress);
  const setStatus = useExcelStore((s) => s.setStatus);

  const hasSteps = steps.length > 0;

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (downloadUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  /** Mulai/stop recording video */
  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      // Stop recording — flush pending data dulu
      if (recorderRef.current?.state === 'recording') {
        recorderRef.current.requestData();
        recorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    if (!canvasRef?.current) {
      setExportMsg('Canvas tidak tersedia');
      return;
    }

    // Reset state sebelum record baru
    setDownloadUrl(null);
    setDownloadName('tutorial.webm');
    setExportMsg(null);

    const recorder = setupMediaRecorder(canvasRef.current, {
      fps: 30,
      onStop: async (blob) => {
        console.log('[record] Blob size:', blob.size, 'bytes');

        if (!blob || blob.size === 0) {
          setExportMsg('Recording kosong. Pastikan ada animasi yang berjalan saat merekam.');
          setStatus('ready');
          return;
        }

        // Coba convert ke MP4 via server
        try {
          setStatus('exporting');
          setExportProgress(30);
          setExportMsg('Mengkonversi ke MP4...');

          const form = new FormData();
          form.append('video', blob, 'tutorial.webm');

          const res = await fetch('/api/convert-mp4', {
            method: 'POST',
            body: form,
          });

          if (res.ok) {
            const data = await res.json();
            if (data.mp4Url) {
              setDownloadUrl(data.mp4Url);
              setDownloadName(data.filename || 'tutorial.mp4');
              setExportProgress(100);
              setStatus('ready');
              setExportMsg(null);
              return;
            }
          }

          // Server gagal, fallback ke WebM
          throw new Error('Server conversion failed');
        } catch (err) {
          console.warn('[record] MP4 conversion gagal, download WebM langsung:', err);
          // Fallback: download WebM langsung
          const url = URL.createObjectURL(blob);
          setDownloadUrl(url);
          setDownloadName('tutorial.webm');
          setExportProgress(100);
          setStatus('ready');
          setExportMsg(null);
        }
      },
      onError: (err) => {
        console.error('[record] MediaRecorder error:', err);
        setIsRecording(false);
        setStatus('error');
        setExportMsg(`Recording error: ${err.message}`);
      },
    });

    if (recorder) {
      recorderRef.current = recorder;
      recorder.start(1000); // chunk setiap 1 detik
      setIsRecording(true);
      setExportProgress(0);
      setExportMsg('Merekam... Klik Stop Recording jika selesai.');
    }
  }, [isRecording, canvasRef, setIsRecording, setExportProgress, setStatus]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state === 'recording') {
        recorderRef.current.stop();
      }
    };
  }, []);

  const btnBase: React.CSSProperties = {
    padding: '8px 16px',
    border: '1px solid #DADCE0',
    borderRadius: 6,
    background: '#FFFFFF',
    cursor: hasSteps ? 'pointer' : 'not-allowed',
    fontSize: 13,
    fontWeight: 500,
    color: hasSteps ? '#202124' : '#9AA0A6',
    fontFamily: "'Segoe UI', sans-serif",
    transition: 'all 0.15s',
  };

  const activeBtn: React.CSSProperties = {
    ...btnBase,
    background: '#217346',
    color: '#FFFFFF',
    border: '1px solid #217346',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 16,
        background: '#F8F9FA',
        borderRadius: 8,
        border: '1px solid #DADCE0',
      }}
    >
      {/* Progress bar */}
      {hasSteps && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              color: '#5F6368',
              marginBottom: 4,
              fontFamily: "'Segoe UI', sans-serif",
            }}
          >
            <span>
              Step {currentStepIndex + 1} / {totalSteps}
            </span>
            <span>{progress}%</span>
          </div>
          <div
            style={{
              width: '100%',
              height: 6,
              background: '#E8EAED',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: '#217346',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Main controls */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          style={btnBase}
          disabled={!hasSteps}
          onClick={prevStep}
          title="Step sebelumnya"
        >
          ⏮ Prev
        </button>

        <button
          style={hasSteps ? { ...activeBtn, minWidth: 90 } : { ...btnBase, minWidth: 90 }}
          disabled={!hasSteps}
          onClick={() => togglePlay(!isPlaying)}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <button
          style={btnBase}
          disabled={!hasSteps}
          onClick={nextStep}
          title="Step berikutnya"
        >
          Next ⏭
        </button>

        <div style={{ flex: 1 }} />

        <select
          value={speed}
          onChange={(e) => setSpeed(e.target.value as any)}
          style={{ ...btnBase, cursor: 'pointer', minWidth: 80 }}
        >
          <option value="slow">Lambat</option>
          <option value="normal">Normal</option>
          <option value="fast">Cepat</option>
        </select>

        <select
          onChange={(e) => setTheme(e.target.value as any)}
          style={{ ...btnBase, cursor: 'pointer', minWidth: 80 }}
        >
          <option value="classic">Excel Classic</option>
          <option value="dark">Dark Mode</option>
          <option value="modern">Modern</option>
        </select>
      </div>

      {/* Recording & Export */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          style={isRecording ? activeBtn : btnBase}
          disabled={!hasSteps || isRecording ? false : (status !== 'ready' && status !== 'generated')}
          onClick={handleToggleRecording}
        >
          {isRecording ? '⏹ Stop Recording' : '🔴 Record Video'}
        </button>

        {/* Video download */}
        {downloadUrl && (
          <a
            href={downloadUrl}
            download={downloadName}
            style={{
              ...btnBase,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#1A73E8',
              color: '#FFFFFF',
              border: '1px solid #1A73E8',
              fontWeight: 600,
            }}
          >
            ⬇ Download {downloadName.endsWith('.mp4') ? 'MP4' : 'WebM'}
          </a>
        )}

        {/* Status info */}
        <span
          style={{
            fontSize: 12,
            color: status === 'error' ? '#C5221F' : '#5F6368',
            fontFamily: "'Segoe UI', sans-serif",
            marginLeft: 'auto',
          }}
        >
          {isRecording && '🎬 Merekam...'}
          {status === 'exporting' && '⏳ Mengkonversi...'}
          {exportMsg && !isRecording && status !== 'exporting' && exportMsg}
          {!exportMsg && status === 'ready' && !isRecording && '✅ Siap'}
          {status === 'idle' && 'Masukkan prompt'}
        </span>
      </div>
    </div>
  );
}
