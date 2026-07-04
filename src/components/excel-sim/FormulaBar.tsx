// ============================================================
// ExcelTutor AI — Formula Bar Component
// ============================================================

'use client';

import { useExcelStore } from '@/store/excel-store';
import { EXCEL_THEMES } from '@/config/constants';
import type { FormulaBarState } from '@/types';

interface FormulaBarProps {
  formulaBar: FormulaBarState;
  className?: string;
}

/**
 * Formula Bar — menampilkan nama cell aktif + formula/content-nya.
 * Gaya mirip Excel asli biar user familiar.
 */
export default function FormulaBar({ formulaBar, className = '' }: FormulaBarProps) {
  const theme = useExcelStore((s) => s.theme);
  const excelTheme = EXCEL_THEMES[theme];
  const isDark = theme === 'dark';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${excelTheme.borderColor}`,
        borderTop: 'none',
        borderBottom: `2px solid ${excelTheme.ribbonBg}`,
        background: excelTheme.formulaBg,
        height: 36,
        fontSize: 13,
      }}
      className={className}
    >
      {/* Cell name — mirip Excel reference area */}
      <div
        style={{
          minWidth: 72,
          textAlign: 'center',
          fontWeight: 700,
          fontSize: 13,
          color: formulaBar.isActive ? excelTheme.cursorColor : (isDark ? '#E0E0E0' : '#202124'),
          borderRight: `1px solid ${excelTheme.borderColor}`,
          padding: '6px 8px',
          fontFamily: "'Segoe UI', 'Calibri', sans-serif",
          userSelect: 'none',
          background: isDark ? '#333' : '#F1F3F4',
        }}
      >
        {formulaBar.cellName || 'A1'}
      </div>

      {/* fx label */}
      <div
        style={{
          minWidth: 28,
          textAlign: 'center',
          fontSize: 12,
          fontStyle: 'italic',
          fontWeight: 700,
          color: excelTheme.ribbonBg,
          borderRight: `1px solid ${excelTheme.borderColor}`,
          padding: '6px 4px',
          userSelect: 'none',
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        fx
      </div>

      {/* Content / Formula — tampil seperti input */}
      <div
        style={{
          flex: 1,
          padding: '6px 10px',
          fontSize: 13,
          fontFamily: "'Consolas', 'Courier New', monospace",
          color: excelTheme.cellColor,
          background: excelTheme.formulaBg,
          borderLeft: formulaBar.isActive
            ? `3px solid ${excelTheme.ribbonBg}`
            : '3px solid transparent',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minHeight: 22,
          lineHeight: '22px',
        }}
        title={formulaBar.formula} // tooltip untuk formula panjang
      >
        {formulaBar.formula || (
          <span style={{ color: isDark ? '#666' : '#9AA0A6', fontStyle: 'italic', fontFamily: "'Segoe UI', sans-serif" }}>
            Ketik rumus atau nilai...
          </span>
        )}
      </div>
    </div>
  );
}
