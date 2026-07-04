// ============================================================
// ExcelTutor AI — Main Page
// ============================================================

'use client';

import { useRef, useMemo } from 'react';
import { useExcelStore } from '@/store/excel-store';
import ExcelGrid from '@/components/excel-sim/ExcelGrid';
import Ribbon from '@/components/excel-sim/Ribbon';
import StepAnimator from '@/components/animation/StepAnimator';
import PlaybackControls from '@/components/controls/PlaybackControls';
import PromptInput from '@/components/controls/PromptInput';
import { EmptyState, StatusBar, Spinner, ErrorDisplay } from '@/components/ui/StatusUI';
import { STATUS_LABELS } from '@/config/constants';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const status = useExcelStore((s) => s.status);
  const steps = useExcelStore((s) => s.steps);
  const error = useExcelStore((s) => s.error);
  const currentStepIndex = useExcelStore((s) => s.currentStepIndex);
  const selectedTemplateId = useExcelStore((s) => s.selectedTemplateId);
  const setError = useExcelStore((s) => s.setError);
  const goToStep = useExcelStore((s) => s.goToStep);

  const currentStep = useMemo(
    () => steps[currentStepIndex] ?? null,
    [steps, currentStepIndex]
  );

  const hasSteps = steps.length > 0;
  const isLoading =
    status === 'generating' || status === 'generating-audio';

  /** Scroll ke grid setelah steps di-generate */
  const handleStepsGenerated = () => {
    setTimeout(() => {
      gridContainerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 300);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F0F4F8',
        fontFamily: "'Segoe UI', 'Calibri', sans-serif",
      }}
    >
      {/* Step Animator (logic only — no UI) */}
      <StepAnimator />

      {/* ─── Header ─── */}
      <header
        style={{
          background: '#217346',
          color: '#FFFFFF',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <span style={{ fontSize: 28 }}>📊</span>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              fontFamily: "'Segoe UI', sans-serif",
            }}
          >
            ExcelTutor AI
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              opacity: 0.8,
              fontFamily: "'Segoe UI', sans-serif",
            }}
          >
            Generator Video Tutorial Excel Otomatis
          </p>
        </div>

        <div style={{ flex: 1 }} />

        <StatusBar status={status} />
      </header>

      {/* ─── Main Content ─── */}
      <main
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Prompt Input */}
        <PromptInput onStepsGenerated={handleStepsGenerated} />

        {/* Error Display */}
        <ErrorDisplay
          error={error}
          onDismiss={() => setError(null)}
        />

        {/* Loading State */}
        {isLoading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            <Spinner
              size={32}
              label={STATUS_LABELS[status]}
            />
          </div>
        )}

        {/* Excel Simulation + Controls */}
        {hasSteps && (
          <div
            ref={gridContainerRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {/* Current step title & narration */}
            {currentStep && (
              <div
                style={{
                  background: '#FFFFFF',
                  padding: '16px',
                  borderRadius: 8,
                  border: '1px solid #DADCE0',
                  fontFamily: "'Segoe UI', sans-serif",
                }}
              >
                {/* Header: step number + title */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      background: '#217346',
                      color: '#FFFFFF',
                      borderRadius: '50%',
                      width: 30,
                      height: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {currentStep.stepNumber}
                  </span>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#202124',
                    }}
                  >
                    {currentStep.title}
                  </h3>
                </div>

                {/* Narration */}
                {currentStep.narration && (
                  <p
                    style={{
                      margin: '0 0 12px 40px',
                      fontSize: 14,
                      color: '#3C4043',
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                    }}
                  >
                    💬 {currentStep.narration}
                  </p>
                )}

                {/* Cell Actions sebagai instruksi detail */}
                {currentStep.cellActions && currentStep.cellActions.length > 0 && (
                  <div style={{ margin: '0 0 8px 40px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 12, color: '#5F6368', fontWeight: 600, marginBottom: 2 }}>INSTRUKSI:</span>
                    {currentStep.cellActions.map((action, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '4px 8px',
                          background: action.highlightColor
                            ? action.highlightColor === 'yellow' ? '#FFFDE7'
                            : action.highlightColor === 'blue' ? '#E3F2FD'
                            : action.highlightColor === 'green' ? '#E8F5E9'
                            : action.highlightColor === 'orange' ? '#FFF3E0'
                            : '#F8F9FA'
                            : '#F8F9FA',
                          borderRadius: 4,
                          fontSize: 13,
                          color: '#202124',
                        }}
                      >
                        <span style={{ fontWeight: 500, minWidth: 60 }}>
                          {action.type === 'highlight' ? '🔦 Sorot' :
                           action.type === 'type' ? '✏️ Ketik' :
                           action.type === 'select' ? '👆 Pilih' :
                           action.type === 'moveCursor' ? '👉 Pindah' : '➡'}
                        </span>
                        <span style={{ fontWeight: 600, color: '#1A73E8' }}>{action.targetCell}</span>
                        {action.value && <span style={{ color: '#5F6368' }}>= <code style={{ background: '#E8EAED', padding: '1px 4px', borderRadius: 3, fontSize: 12 }}>{action.value}</code></span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Formula Bar Info */}
                {currentStep.formulaBar && currentStep.formulaBar.formula && (
                  <div
                    style={{
                      margin: '0 0 0 40px',
                      padding: '8px 12px',
                      background: '#F1F8E9',
                      border: '1px solid #C8E6C9',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#2E7D32' }}>fx</span>
                    <span style={{ color: '#1B5E20', fontFamily: "'Consolas', 'Courier New', monospace", fontWeight: 600 }}>
                      {currentStep.formulaBar.cellName && <>{currentStep.formulaBar.cellName}: </>}
                      {currentStep.formulaBar.formula}
                    </span>
                    {currentStep.formulaBar.isActive && (
                      <span style={{ fontSize: 11, color: '#558B2F' }}>⚡ aktif</span>
                    )}
                  </div>
                )}

                {/* Tooltip */}
                {currentStep.tooltip && (
                  <div
                    style={{
                      margin: '8px 0 0 40px',
                      padding: '6px 10px',
                      background: '#FFF8E1',
                      border: '1px solid #FFE082',
                      borderRadius: 6,
                      fontSize: 12,
                      color: '#F57F17',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>💡</span>
                    <span><strong>{currentStep.tooltip.targetCell}:</strong> {currentStep.tooltip.text}</span>
                  </div>
                )}
              </div>
            )}

            {/* Ribbon + Grid */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #DADCE0',
                overflow: 'hidden',
              }}
            >
              <Ribbon sheetName="Tutorial" />
              <ExcelGrid externalCanvasRef={canvasRef as any} />
            </div>

            {/* Playback Controls (pass canvas ref for recording) */}
            <PlaybackControls
              canvasRef={canvasRef as any}
            />
          </div>
        )}

        {/* Empty State */}
        {!hasSteps && !isLoading && status !== 'error' && (
          <EmptyState />
        )}

        {/* Step List (sidebar style) - detail */}
        {hasSteps && steps.length > 0 && (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #DADCE0',
              padding: 16,
            }}
          >
            <h3
              style={{
                margin: '0 0 12px',
                fontSize: 14,
                fontWeight: 600,
                color: '#202124',
                fontFamily: "'Segoe UI', sans-serif",
              }}
            >
              Daftar Step ({steps.length})
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {steps.map((step, i) => {
                const isCurrent = currentStepIndex === i;
                return (
                  <button
                    key={step.stepNumber}
                    onClick={() => goToStep(i)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      padding: '10px 12px',
                      border: isCurrent ? '2px solid #217346' : '1px solid #E8EAED',
                      borderRadius: 8,
                      background: isCurrent ? '#E6F4EA' : '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: "'Segoe UI', sans-serif",
                      transition: 'all 0.15s',
                    }}
                  >
                    {/* Header: step number + title + duration */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: isCurrent ? '#217346' : '#E8EAED',
                          color: isCurrent ? '#FFFFFF' : '#5F6368',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {step.stepNumber}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: isCurrent ? '#217346' : '#202124',
                          flex: 1,
                        }}
                      >
                        {step.title}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: '#9AA0A6',
                          flexShrink: 0,
                        }}
                      >
                        {(step.duration / 1000).toFixed(1)}s
                      </span>
                    </div>

                    {/* Narration preview */}
                    {step.narration && (
                      <p
                        style={{
                          margin: '2px 0 2px 32px',
                          fontSize: 11,
                          color: '#3C4043',
                          lineHeight: 1.4,
                          fontStyle: 'italic',
                        }}
                      >
                        {step.narration}
                      </p>
                    )}

                    {/* Cell Actions badge */}
                    {step.cellActions && step.cellActions.length > 0 && (
                      <div style={{ margin: '2px 0 0 32px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {step.cellActions.map((action, ai) => (
                          <span
                            key={ai}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 6px',
                              background: action.type === 'type' ? '#E8F5E9'
                                : action.type === 'highlight' ? '#FFFDE7'
                                : action.type === 'select' ? '#E3F2FD'
                                : '#FFF3E0',
                              borderRadius: 4,
                              fontSize: 10,
                              color: '#202124',
                            }}
                          >
                            <span>
                              {action.type === 'highlight' ? '🔦' :
                               action.type === 'type' ? '✏️' :
                               action.type === 'select' ? '👆' : '👉'}
                            </span>
                            <span style={{ fontWeight: 600, color: '#1A73E8' }}>{action.targetCell}</span>
                            {action.value && (
                              <code style={{ fontSize: 10, background: '#E8EAED', padding: '1px 3px', borderRadius: 2 }}>{action.value}</code>
                            )}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Formula bar info */}
                    {step.formulaBar?.formula && (
                      <div
                        style={{
                          margin: '2px 0 0 32px',
                          padding: '3px 8px',
                          background: '#F1F8E9',
                          borderRadius: 4,
                          fontSize: 10,
                          color: '#1B5E20',
                          fontFamily: "'Consolas', 'Courier New', monospace",
                        }}
                      >
                        fx {step.formulaBar.formula}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ─── Footer ─── */}
      <footer
        style={{
          textAlign: 'center',
          padding: '16px',
          color: '#9AA0A6',
          fontSize: 12,
          fontFamily: "'Segoe UI', sans-serif",
          borderTop: '1px solid #E8EAED',
          marginTop: 24,
        }}
      >
        ExcelTutor AI v1.0 — Dibuat dengan ❤️
      </footer>
    </div>
  );
}
