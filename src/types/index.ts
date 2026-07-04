// ============================================================
// ExcelTutor AI — TypeScript Interfaces & Types
// ============================================================

/** Cell action type dalam sebuah step tutorial */
export type CellActionType =
  | 'highlight'   // Sorot cell dengan warna
  | 'type'        // Ketik value ke cell
  | 'select'      // Pilih cell/range
  | 'moveCursor'; // Pindah kursor ke cell

/** Warna highlight yang tersedia */
export type HighlightColor = 'yellow' | 'blue' | 'green' | 'orange';

/** Satu aksi di cell Excel */
export interface CellAction {
  type: CellActionType;
  targetCell: string;      // e.g. "B3"
  value?: string;          // Untuk type action
  highlightColor?: HighlightColor;
  delay?: number;          // ms offset dalam step (default: 0)
}

/** State formula bar */
export interface FormulaBarState {
  cellName: string;  // Cell yang aktif, e.g. "B3"
  formula: string;   // Formula/content yang ditampilkan
  isActive: boolean; // Apakah formula bar sedang fokus
}

/** Tooltip yang muncul di cell tertentu */
export interface TooltipConfig {
  targetCell: string;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/** Satu step tutorial */
export interface SimStep {
  stepNumber: number;
  title: string;
  narration: string;        // Max 2 kalimat, Bahasa Indonesia
  duration: number;         // ms — di-set SETELAH generate TTS
  cellActions: CellAction[];
  formulaBar: FormulaBarState;
  tooltip?: TooltipConfig;
}

/** Konfigurasi kolom Excel */
export interface ColumnConfig {
  id: string;       // 'A', 'B', 'C', ...
  name: string;     // 'Product ID', 'Price', ...
  width: number;    // Dalam karakter/unit
  type?: 'text' | 'number' | 'currency' | 'date';
}

/** Konfigurasi data Excel untuk satu sheet */
export interface ExcelConfig {
  columns: ColumnConfig[];
  initialData: Record<string, string>; // cellId: value, e.g. { "A2": "P001" }
  sheetName: string;
}

/** Template spreadsheet yang bisa dipilih user */
export interface ExcelTemplate {
  id: string;
  name: string;
  description: string;
  columns: ColumnConfig[];
  initialData: Record<string, string>;
  /** Arahan untuk LLM agar generate step sesuai konteks data */
  systemHint: string;
  /** Contoh prompt yang bisa langsung dipakai */
  examplePrompt: string;
}

/** Status aplikasi secara keseluruhan */
export type AppStatus =
  | 'idle'           // Belum ada input
  | 'generating'     // LLM sedang generate steps
  | 'generated'      // Steps siap
  | 'generating-audio' // TTS sedang generate
  | 'ready'          // Semua siap, bisa diputar
  | 'recording'      // Sedang record video
  | 'exporting'      // Konversi video
  | 'error';         // Error state

/** App-level error */
export interface AppError {
  code: string;
  message: string;
  details?: string;
}

/** Respon dari API generate-steps */
export interface GenerateStepsResponse {
  steps: SimStep[];
  templateUsed?: string;
}

/** Respon dari API generate-audio */
export interface GenerateAudioResponse {
  audioUrls: string[];
  durations: number[];
}

/** Respon dari API convert-mp4 */
export interface ConvertMp4Response {
  mp4Url: string;
  filename: string;
  sizeBytes: number;
}

/** Kecepatan animasi */
export type AnimationSpeed = 'slow' | 'normal' | 'fast';

/** Tema warna Excel */
export type ExcelTheme = 'classic' | 'dark' | 'modern';
