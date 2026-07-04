// ============================================================
// ExcelTutor AI — Zustand Global Store
// ============================================================

import { create } from 'zustand';
import type {
  SimStep, AppStatus, AppError, ExcelConfig,
  ExcelTemplate, AnimationSpeed, ExcelTheme,
} from '@/types';
import { ANIMATION_SPEEDS } from '@/config/constants';

interface ExcelStore {
  // ── State ──
  status: AppStatus;
  error: AppError | null;
  prompt: string;
  selectedTemplateId: string;
  excelConfig: ExcelConfig;
  steps: SimStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: AnimationSpeed;
  theme: ExcelTheme;

  // Audio (generated per step)
  audioUrls: string[];
  audioDurations: number[];

  // Video
  videoUrl: string | null;
  videoFilename: string | null;
  isRecording: boolean;
  exportProgress: number; // 0-100

  // ── Actions ──
  setPrompt: (prompt: string) => void;
  setSelectedTemplate: (templateId: string) => void;
  setExcelConfig: (config: ExcelConfig) => void;
  setStatus: (status: AppStatus) => void;
  setError: (error: AppError | null) => void;
  setSteps: (steps: SimStep[]) => void;
  setCurrentStep: (index: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setSpeed: (speed: AnimationSpeed) => void;
  setTheme: (theme: ExcelTheme) => void;
  setAudioUrls: (urls: string[], durations: number[]) => void;
  setVideoUrl: (url: string | null, filename?: string | null) => void;
  setExportProgress: (progress: number) => void;
  setIsRecording: (recording: boolean) => void;

  // ── Computed ──
  currentStep: () => SimStep | null;
  totalSteps: () => number;
  animationSpeed: () => { cursorMove: number; typeDelay: number; highlightFade: number; stepGap: number };
  isLastStep: () => boolean;
  isFirstStep: () => boolean;
  progress: () => number; // 0-100

  // ── Helpers ──
  applyTemplate: (template: ExcelTemplate) => void;
  reset: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
}

const initialState = {
  status: 'idle' as AppStatus,
  error: null as AppError | null,
  prompt: '',
  selectedTemplateId: 'custom',
  excelConfig: {
    columns: [{ id: 'A', name: 'A', width: 12 }, { id: 'B', name: 'B', width: 12 }, { id: 'C', name: 'C', width: 12 }],
    initialData: {},
    sheetName: 'Sheet1',
  } as ExcelConfig,
  steps: [] as SimStep[],
  currentStepIndex: 0,
  isPlaying: false,
  speed: 'normal' as AnimationSpeed,
  theme: 'classic' as ExcelTheme,
  audioUrls: [] as string[],
  audioDurations: [] as number[],
  videoUrl: null as string | null,
  videoFilename: null as string | null,
  isRecording: false,
  exportProgress: 0,
};

export const useExcelStore = create<ExcelStore>((set, get) => ({
  ...initialState,

  setPrompt: (prompt) => set({ prompt }),
  setSelectedTemplate: (id) => set({ selectedTemplateId: id }),
  setExcelConfig: (config) => set({ excelConfig: config }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: error ? 'error' : get().status }),
  setSteps: (steps) => set({
    steps,
    currentStepIndex: 0,
    status: 'generated',
    error: null,
  }),
  setCurrentStep: (index) => set({ currentStepIndex: index }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setSpeed: (speed) => set({ speed }),
  setTheme: (theme) => set({ theme }),
  setAudioUrls: (urls, durations) => set({
    audioUrls: urls,
    audioDurations: durations,
    status: 'ready',
  }),
  setVideoUrl: (url, filename) => set({
    videoUrl: url,
    videoFilename: filename || null,
  }),
  setExportProgress: (progress) => set({ exportProgress: progress }),
  setIsRecording: (recording) => set({ isRecording: recording }),

  // Computed
  currentStep: () => {
    const { steps, currentStepIndex } = get();
    return steps[currentStepIndex] ?? null;
  },
  totalSteps: () => get().steps.length,
  animationSpeed: () => ANIMATION_SPEEDS[get().speed],
  isLastStep: () => get().currentStepIndex >= get().steps.length - 1,
  isFirstStep: () => get().currentStepIndex <= 0,
  progress: () => {
    const { steps, currentStepIndex } = get();
    if (steps.length === 0) return 0;
    return Math.round(((currentStepIndex + 1) / steps.length) * 100);
  },

  // Helpers
  applyTemplate: (template) => set({
    excelConfig: {
      columns: template.columns,
      initialData: { ...template.initialData },
      sheetName: 'Sheet1',
    },
    selectedTemplateId: template.id,
  }),

  reset: () => set({ ...initialState }),

  nextStep: () => {
    const { currentStepIndex, steps } = get();
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  goToStep: (index) => {
    const { steps } = get();
    if (index >= 0 && index < steps.length) {
      set({ currentStepIndex: index });
    }
  },
}));
