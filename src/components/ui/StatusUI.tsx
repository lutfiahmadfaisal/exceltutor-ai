// ============================================================
// ExcelTutor AI — Loading & Error States
// ============================================================

'use client';

import { ERROR_MESSAGES } from '@/config/constants';
import type { AppError } from '@/types';

/** Skeleton loader untuk loading states */
export function SkeletonLoader({
  lines = 3,
  width = '100%',
}: {
  lines?: number;
  width?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 14,
            background: 'linear-gradient(90deg, #E8EAED 25%, #F1F3F4 50%, #E8EAED 75%)',
            backgroundSize: '200% 100%',
            borderRadius: 4,
            width: i === lines - 1 ? '60%' : '100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

/** Spinner component */
export function Spinner({
  size = 24,
  color = '#217346',
  label,
}: {
  size?: number;
  color?: string;
  label?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: 16,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: `3px solid #E8EAED`,
          borderTopColor: color,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {label && (
        <span
          style={{
            fontSize: 13,
            color: '#5F6368',
            fontFamily: "'Segoe UI', sans-serif",
          }}
        >
          {label}
        </span>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/** Error display component */
export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
}: {
  error: AppError | string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error.message;
  const code = typeof error === 'object' && 'code' in error ? error.code : null;
  const defaultMsg = code ? ERROR_MESSAGES[code] : null;

  return (
    <div
      style={{
        padding: '12px 16px',
        background: '#FCE8E6',
        border: '1px solid #F5C6C2',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>❌</span>
        <span
          style={{
            fontSize: 14,
            color: '#C5221F',
            fontWeight: 500,
            fontFamily: "'Segoe UI', sans-serif",
            flex: 1,
          }}
        >
          {defaultMsg || message}
        </span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 18,
              color: '#C5221F',
              padding: '0 4px',
            }}
          >
            ×
          </button>
        )}
      </div>
      {defaultMsg && message !== defaultMsg && (
        <span
          style={{
            fontSize: 12,
            color: '#5F6368',
            fontFamily: "'Segoe UI', sans-serif",
            marginLeft: 24,
          }}
        >
          Detail: {message}
        </span>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '6px 16px',
            background: '#C5221F',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: "'Segoe UI', sans-serif",
            alignSelf: 'flex-start',
          }}
        >
          🔄 Coba Lagi
        </button>
      )}
    </div>
  );
}

/** Empty state */
export function EmptyState({
  icon = '📊',
  title = 'Belum ada tutorial',
  description = 'Pilih template dan masukkan topik, lalu klik Generate Tutorial untuk memulai.',
}: {
  icon?: string;
  title?: string;
  description?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        color: '#9AA0A6',
        textAlign: 'center',
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <span style={{ fontSize: 48, marginBottom: 12 }}>{icon}</span>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: '#5F6368' }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: 13, maxWidth: 360, lineHeight: 1.5 }}>
        {description}
      </p>
    </div>
  );
}

/** Status indicator bar */
export function StatusBar({
  status,
}: {
  status: string;
}) {
  const statusConfig: Record<string, { icon: string; color: string; bg: string }> = {
    idle: { icon: '💡', color: '#5F6368', bg: '#F1F3F4' },
    generating: { icon: '⏳', color: '#E37400', bg: '#FEF7E0' },
    generated: { icon: '✅', color: '#1E8E3E', bg: '#E6F4EA' },
    'generating-audio': { icon: '🔊', color: '#1A73E8', bg: '#E8F0FE' },
    ready: { icon: '🎬', color: '#217346', bg: '#E6F4EA' },
    recording: { icon: '🔴', color: '#C5221F', bg: '#FCE8E6' },
    exporting: { icon: '⏳', color: '#E37400', bg: '#FEF7E0' },
    error: { icon: '❌', color: '#C5221F', bg: '#FCE8E6' },
  };

  const cfg = statusConfig[status] || statusConfig.idle;

  return (
    <div
      style={{
        padding: '6px 12px',
        background: cfg.bg,
        borderRadius: 4,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: cfg.color,
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <span>{cfg.icon}</span>
      <span>{status.toUpperCase()}</span>
    </div>
  );
}
