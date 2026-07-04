// ============================================================
// ExcelTutor AI — Excel Ribbon (Toolbar)
// ============================================================

'use client';

import { useExcelStore } from '@/store/excel-store';
import { EXCEL_THEMES } from '@/config/constants';

interface RibbonProps {
  sheetName?: string;
  className?: string;
}

/**
 * Excel-style ribbon toolbar.
 * Tampilan visual aja — bisa diklik untuk memberikan feel realistis.
 */
export default function Ribbon({ sheetName = 'Sheet1', className = '' }: RibbonProps) {
  const theme = useExcelStore((s) => s.theme);
  const excelTheme = EXCEL_THEMES[theme];
  const isDark = theme === 'dark';

  const ribbonTabs = ['Beranda', 'Sisipkan', 'Tata Letak', 'Rumus', 'Data', 'Tinjau', 'Tampilan'];

  return (
    <div className={className}>
      {/* Tab bar */}
      <div
        style={{
          background: isDark ? '#2D2D2D' : '#F8F9FA',
          borderBottom: `1px solid ${excelTheme.borderColor}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 4px',
          height: 28,
          gap: 2,
        }}
      >
        {ribbonTabs.map((tab, i) => (
          <button
            key={tab}
            style={{
              padding: '4px 12px',
              fontSize: 11,
              fontWeight: i === 0 ? 600 : 400,
              border: 'none',
              borderBottom: i === 0
                ? `2px solid ${excelTheme.ribbonBg}`
                : '2px solid transparent',
              background: isDark ? '#2D2D2D' : '#F8F9FA',
              color: isDark ? '#E0E0E0' : '#202124',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontFamily: "'Segoe UI', 'Calibri', sans-serif",
            }}
          >
            {tab}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Sheet name */}
        <span
          style={{
            fontSize: 11,
            color: isDark ? '#9AA0A6' : '#5F6368',
            paddingRight: 8,
            fontFamily: "'Segoe UI', 'Calibri', sans-serif",
          }}
        >
          {sheetName}
        </span>
      </div>

      {/* Toolbar row (simplified) */}
      <div
        style={{
          background: excelTheme.ribbonBg,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 4,
        }}
      >
        {/* Quick actions */}
        {[
          { label: 'B', icon: '𝐁', tooltip: 'Bold' },
          { label: 'I', icon: '𝐼', tooltip: 'Italic' },
          { label: 'U', icon: 'U̲', tooltip: 'Underline' },
        ].map((btn) => (
          <button
            key={btn.label}
            title={btn.tooltip}
            style={{
              padding: '4px 8px',
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              color: '#FFFFFF',
              cursor: 'pointer',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 13,
              fontFamily: "'Segoe UI', sans-serif",
            }}
          >
            {btn.icon}
          </button>
        ))}

        <div style={{ width: 8 }} />

        {['Wrap Text', 'Merge & Center', 'General', '%', '000'].map((label) => (
          <button
            key={label}
            style={{
              padding: '4px 8px',
              border: 'none',
              background: 'rgba(255,255,255,0.08)',
              color: '#FFFFFF',
              cursor: 'pointer',
              borderRadius: 2,
              fontSize: 11,
              fontFamily: "'Segoe UI', 'Calibri', sans-serif",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
