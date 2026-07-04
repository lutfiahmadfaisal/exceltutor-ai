// ============================================================
// ExcelTutor AI — Step Animation Engine
// ============================================================

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useExcelStore } from '@/store/excel-store';

/**
 * StepAnimator — handles auto-playback of steps with audio sync.
 * Tidak render UI sendiri, tapi trigger state changes di store.
 */
export default function StepAnimator() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stepStartRef = useRef<number>(0);

  const isPlaying = useExcelStore((s) => s.isPlaying);
  const steps = useExcelStore((s) => s.steps);
  const currentStepIndex = useExcelStore((s) => s.currentStepIndex);
  const speed = useExcelStore((s) => s.speed);
  const isLastStep = useExcelStore((s) => s.isLastStep());
  const audioUrls = useExcelStore((s) => s.audioUrls);
  const audioDurations = useExcelStore((s) => s.audioDurations);

  const nextStep = useExcelStore((s) => s.nextStep);
  const setIsPlaying = useExcelStore((s) => s.setIsPlaying);
  const setStatus = useExcelStore((s) => s.setStatus);

  // Ambil data terbaru tanpa subscribe ke tiap perubahan
  const getStore = useExcelStore.getState;

  /** Main play loop */
  const advanceStep = useCallback(() => {
    const state = getStore();
    if (state.currentStepIndex >= state.steps.length - 1) {
      // Selesai
      setIsPlaying(false);
      setStatus('ready');
      return;
    }

    nextStep();
  }, [nextStep, setIsPlaying, setStatus, getStore]);

  // Handle audio playback
  useEffect(() => {
    if (!isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const state = getStore();
    const step = state.steps[state.currentStepIndex];
    if (!step) return;

    // Play audio for current step
    if (audioUrls[state.currentStepIndex]) {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(audioUrls[state.currentStepIndex]);
        audioRef.current = audio;
        audio.play().catch(() => {
          // Audio play might fail if user hasn't interacted — that's ok
        });
      } catch {
        // Audio error — continue anyway
      }
    }

    // Determine next step timing
    const duration = audioDurations[state.currentStepIndex] || step.duration || 3000;
    const speedFactor =
      state.speed === 'slow' ? 1.5 :
      state.speed === 'fast' ? 0.5 :
      1;

    stepStartRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      advanceStep();
    }, duration * speedFactor);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, audioUrls, audioDurations, advanceStep, getStore]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // No UI — purely logic
  return null;
}
