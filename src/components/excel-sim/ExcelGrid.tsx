// ============================================================
// ExcelTutor AI — Excel Grid Renderer
// ============================================================

'use client';

import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { useExcelStore } from '@/store/excel-store';
import { EXCEL_THEMES, HIGHLIGHT_COLORS, ANIMATION_SPEEDS } from '@/config/constants';
import type { CellAction, SimStep, FormulaBarState, TooltipConfig, ColumnConfig } from '@/types';
import FormulaBar from './FormulaBar';

interface ExcelGridProps {
  width?: number;
  height?: number;
  externalCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

const ROW_HEIGHT = 26;
const ROW_HEADER_WIDTH = 46;
const MAX_ROWS = 15;
const HEADER_HEIGHT = 24;

export default function ExcelGrid({
  width = 1280,
  height = 600,
  externalCanvasRef,
}: ExcelGridProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  // Use external ref if provided, otherwise use internal
  const canvasRef = externalCanvasRef || internalCanvasRef;
  const containerRef = useRef<HTMLDivElement>(null);

  const theme = useExcelStore((s) => s.theme);
  const speed = useExcelStore((s) => s.speed);
  const excelConfig = useExcelStore((s) => s.excelConfig);
  const currentStepIndex = useExcelStore((s) => s.currentStepIndex);
  const stepsForCurrent = useExcelStore((s) => s.steps);
  const currentStep = useMemo(
    () => stepsForCurrent[currentStepIndex] ?? null,
    [stepsForCurrent, currentStepIndex]
  );
  const isPlaying = useExcelStore((s) => s.isPlaying);
  const isRecording = useExcelStore((s) => s.isRecording);

  const speedSettings = ANIMATION_SPEEDS[speed];
  const excelTheme = EXCEL_THEMES[theme];

  // Column widths from config
  const columns = useMemo(() => {
    return excelConfig.columns.length > 0
      ? excelConfig.columns
      : [{ id: 'A', name: 'A', width: 12 } as ColumnConfig];
  }, [excelConfig.columns]);

  // Cell data — merged from initialData + typed values from steps
  const cellData = useMemo(() => {
    const data: Record<string, string> = { ...excelConfig.initialData };
    // Steps can modify cell data via "type" actions
    // This is updated per current step
    return data;
  }, [excelConfig.initialData]);

  // Animasi vars
  const [cursorCell, setCursorCell] = useState('A1');
  const [highlightedCells, setHighlightedCells] = useState<Record<string, string>>({});
  const [typedCells, setTypedCells] = useState<Record<string, string>>({});
  const [formulaBarState, setFormulaBarState] = useState<FormulaBarState>({
    cellName: '',
    formula: '',
    isActive: false,
  });
  const [tooltipData, setTooltipData] = useState<TooltipConfig | null>(null);

  // Compute grid dimensions
  const totalColWidth = useMemo(() => {
    return columns.reduce((sum, col) => sum + col.width * 8, 0);
  }, [columns]);

  const gridContentWidth = ROW_HEADER_WIDTH + totalColWidth;
  const visibleRows = Math.min(MAX_ROWS, 15);

  // Hitung lebar per kolom
  const colWidths = useMemo(() => {
    return columns.map((col) => col.width * 8);
  }, [columns]);

  // Cell ID -> pixel rect
  const getCellRect = useCallback(
    (cellId: string): { x: number; y: number; w: number; h: number } | null => {
      const match = cellId.match(/^([A-Z]+)(\d+)$/);
      if (!match) return null;
      const colStr = match[1];
      const rowStr = parseInt(match[2], 10);

      const colIndex = columns.findIndex((c) => c.id === colStr);
      if (colIndex < 0) return null;

      const x =
        ROW_HEADER_WIDTH +
        colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0) +
        1;
      const y = HEADER_HEIGHT + (rowStr - 1) * ROW_HEIGHT + 1;
      const w = colWidths[colIndex] - 2;
      const h = ROW_HEIGHT - 2;

      return { x, y, w, h };
    },
    [columns, colWidths]
  );

  // Execute cell actions untuk current step
  useEffect(() => {
    if (!currentStep) return;

    const actions = currentStep.cellActions || [];
    const newHighlighted: Record<string, string> = {};
    const newTyped: Record<string, string> = { ...cellData };

    let cursorTarget = 'A1';
    let tooltip: TooltipConfig | undefined;
    let formulaBar: FormulaBarState = {
      cellName: '',
      formula: '',
      isActive: false,
    };

    for (const action of actions) {
      switch (action.type) {
        case 'highlight':
          if (action.highlightColor) {
            newHighlighted[action.targetCell] = action.highlightColor;
          }
          cursorTarget = action.targetCell;
          break;
        case 'type':
          cursorTarget = action.targetCell;
          if (action.value !== undefined) {
            newTyped[action.targetCell] = action.value;
          }
          break;
        case 'select':
          cursorTarget = action.targetCell;
          break;
        case 'moveCursor':
          cursorTarget = action.targetCell;
          break;
      }
    }

    // Formula bar state from step
    formulaBar = currentStep.formulaBar || {
      cellName: cursorTarget,
      formula: newTyped[cursorTarget] || '',
      isActive: false,
    };
    tooltip = currentStep.tooltip;

    // Animate
    const stepTimeout = setTimeout(() => {
      setCursorCell(cursorTarget);
      setHighlightedCells(newHighlighted);
      setTypedCells(newTyped);
      setFormulaBarState(formulaBar);
      setTooltipData(tooltip || null);
    }, speedSettings.highlightFade);

    return () => clearTimeout(stepTimeout);
  }, [currentStep, currentStepIndex, speedSettings]);

  // Render grid ke canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = Math.min(width, gridContentWidth + 20);
    canvas.width = displayWidth * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Parse cursor cell for column/row highlighting
    const cursorMatch = cursorCell.match(/^([A-Z]+)(\d+)$/);
    const cursorColLetter = cursorMatch ? cursorMatch[1] : '';
    const cursorRowNum = cursorMatch ? cursorMatch[2] : '';

    // Background
    ctx.fillStyle = excelTheme.gridBg;
    ctx.fillRect(0, 0, displayWidth, height);

    // ── Column headers ──
    ctx.fillStyle = excelTheme.headerBg;
    ctx.fillRect(0, 0, displayWidth, HEADER_HEIGHT);
    ctx.fillStyle = excelTheme.borderColor;
    ctx.fillRect(0, HEADER_HEIGHT, displayWidth, 1);

    // Row header column
    ctx.fillStyle = excelTheme.headerBg;
    ctx.fillRect(0, 0, ROW_HEADER_WIDTH, height);
    ctx.fillStyle = excelTheme.borderColor;
    ctx.fillRect(ROW_HEADER_WIDTH, 0, 1, height);

    // Column headers text
    ctx.fillStyle = excelTheme.cellColor;
    ctx.font = '11px "Segoe UI", "Calibri", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let colX = ROW_HEADER_WIDTH;
    columns.forEach((col, i) => {
      const isCursorCol = col.id === cursorColLetter;
      // Highlight column header jika cell ini yang aktif
      ctx.fillStyle = isCursorCol ? excelTheme.cursorColor : excelTheme.headerBg;
    ctx.fillRect(colX, 0, colWidths[i], HEADER_HEIGHT);
      ctx.fillStyle = excelTheme.borderColor;
      ctx.fillRect(colX + colWidths[i], 0, 1, HEADER_HEIGHT);
      // Bottom border highlight untuk column aktif
      if (isCursorCol) {
        ctx.fillStyle = excelTheme.cursorColor;
        ctx.fillRect(colX + 1, HEADER_HEIGHT - 3, colWidths[i] - 2, 3);
      }
      // Text warna putih kalau column aktif
      ctx.fillStyle = isCursorCol ? '#FFFFFF' : excelTheme.cellColor;
      ctx.fillText(col.name, colX + colWidths[i] / 2, HEADER_HEIGHT / 2);
      colX += colWidths[i];
    });

    // ── Grid cells ──
    for (let row = 1; row <= visibleRows; row++) {
      const y = HEADER_HEIGHT + (row - 1) * ROW_HEIGHT;

      // Row header — highlight jika row ini yang aktif
      const isCursorRow = String(row) === cursorRowNum;
      ctx.fillStyle = isCursorRow ? excelTheme.cursorColor : excelTheme.headerBg;
      ctx.fillRect(0, y, ROW_HEADER_WIDTH, ROW_HEIGHT);
      // Right border highlight untuk row aktif
      if (isCursorRow) {
        ctx.fillStyle = excelTheme.cursorColor;
        ctx.fillRect(ROW_HEADER_WIDTH - 3, y + 1, 3, ROW_HEIGHT - 2);
      }
      ctx.fillStyle = excelTheme.borderColor;
      ctx.fillRect(0, y + ROW_HEIGHT, displayWidth, 1);
      ctx.fillStyle = isCursorRow ? '#FFFFFF' : excelTheme.cellColor;
      ctx.textAlign = 'center';
      ctx.fillText(String(row), ROW_HEADER_WIDTH / 2, y + ROW_HEIGHT / 2);

      colX = ROW_HEADER_WIDTH;
      for (let col = 0; col < columns.length; col++) {
        const cellId = `${columns[col].id}${row}`;
        const val = typedCells[cellId] ?? cellData[cellId] ?? '';

        // Cell background
        if (highlightedCells[cellId]) {
          ctx.fillStyle = HIGHLIGHT_COLORS[highlightedCells[cellId]] || 'rgba(255,255,0,0.3)';
        } else {
          ctx.fillStyle = excelTheme.gridBg;
        }
        ctx.fillRect(colX + 1, y + 1, colWidths[col] - 2, ROW_HEIGHT - 2);

        // Cursor — lebih tebal dan jelas
        if (cursorCell === cellId) {
          // Outer border
          ctx.strokeStyle = excelTheme.cursorColor;
          ctx.lineWidth = 3;
          ctx.strokeRect(colX + 1.5, y + 1.5, colWidths[col] - 3, ROW_HEIGHT - 3);
          // Inner glow (transparan)
          ctx.strokeStyle = excelTheme.cursorColor + '40';
          ctx.lineWidth = 6;
          ctx.strokeRect(colX + 3, y + 3, colWidths[col] - 6, ROW_HEIGHT - 6);
        }

        // Cell text
        if (val) {
          ctx.fillStyle = excelTheme.cellColor;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.font = '12px "Calibri", "Segoe UI", sans-serif';
          const textX = colX + 6;
          const textY = y + ROW_HEIGHT / 2;
          const maxW = colWidths[col] - 14;
          if (ctx.measureText(val).width > maxW) {
            // Truncate
            let truncated = val;
            while (ctx.measureText(truncated + '…').width > maxW && truncated.length > 1) {
              truncated = truncated.slice(0, -1);
            }
            ctx.fillText(truncated + '…', textX, textY);
          } else {
            ctx.fillText(val, textX, textY);
          }
        }

        // Vertical grid line
        ctx.fillStyle = excelTheme.borderColor;
        ctx.fillRect(colX + colWidths[col], y, 1, ROW_HEIGHT);

        colX += colWidths[col];
      }
    }

    // ── Tooltip ──
    if (tooltipData) {
      const rect = getCellRect(tooltipData.targetCell);
      if (rect) {
        const tipX = rect.x + rect.w / 2 - 80;
        const tipY = rect.y - 36;
        const tipW = 160;
        const tipH = 30;

        // Tooltip background
        ctx.fillStyle = 'rgba(60, 64, 67, 0.95)';
        ctx.beginPath();
        ctx.roundRect(tipX, tipY, tipW, tipH, 6);
        ctx.fill();

        // Arrow
        ctx.fillStyle = 'rgba(60, 64, 67, 0.95)';
        ctx.beginPath();
        ctx.moveTo(rect.x + rect.w / 2 - 5, tipY + tipH);
        ctx.lineTo(rect.x + rect.w / 2, tipY + tipH + 5);
        ctx.lineTo(rect.x + rect.w / 2 + 5, tipY + tipH);
        ctx.fill();

        // Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '11px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tooltipData.text, tipX + tipW / 2, tipY + tipH / 2);
      }
    }
  }, [
    excelTheme,
    columns,
    colWidths,
    cellData,
    typedCells,
    highlightedCells,
    cursorCell,
    tooltipData,
    visibleRows,
    width,
    height,
    gridContentWidth,
    currentStepIndex,
    getCellRect,
  ]);

  const gridOuterStyle: React.CSSProperties = {
    overflow: 'hidden',
    borderRadius: 4,
    border: `1px solid ${excelTheme.borderColor}`,
    background: excelTheme.gridBg,
  };

  return (
    <div ref={containerRef} style={gridOuterStyle}>
      {/* Formula bar */}
      <FormulaBar formulaBar={formulaBarState} />

      {/* Canvas grid */}
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          maxWidth: '100%',
        }}
      />

      {/* Cursor indicator bar */}
      <div
        style={{
          background: excelTheme.headerBg,
          borderTop: `1px solid ${excelTheme.borderColor}`,
          padding: '2px 8px',
          fontSize: 11,
          color: excelTheme.cellColor,
          fontFamily: "'Segoe UI', 'Calibri', sans-serif",
          display: 'flex',
          gap: 16,
        }}
      >
        <span>
          Cell: <strong>{cursorCell}</strong>
        </span>
        {currentStep && (
          <span>
            Step: {currentStep.stepNumber}/{useExcelStore.getState().steps.length}
          </span>
        )}
      </div>
    </div>
  );
}
