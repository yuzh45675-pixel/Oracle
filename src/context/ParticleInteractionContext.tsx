"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from "react";
import type { FormationId } from "@/lib/themes";

interface FocusAnchor {
  x: number;
  y: number;
}

/** 动画信号走 ref，避免每次爆发/聚焦触发整树 React 重渲染与 GC */
export interface ParticleSignals {
  burstTick: number;
  formation: FormationId | null;
  formationStrength: number;
  focusAnchor: FocusAnchor | null;
  focusStrength: number;
  ritualExpand: number;
  ritualActive: boolean;
}

interface ParticleInteractionValue {
  signalsRef: MutableRefObject<ParticleSignals>;
  triggerBurst: () => void;
  triggerFormation: (id: FormationId) => void;
  releaseFormation: () => void;
  setFocusAnchor: (x: number | null, y: number | null) => void;
  setFocusFromElement: (el: HTMLElement | null) => void;
  triggerRitualTransition: () => Promise<void>;
}

const ParticleInteractionContext =
  createContext<ParticleInteractionValue | null>(null);

const defaultSignals = (): ParticleSignals => ({
  burstTick: 0,
  formation: null,
  formationStrength: 0,
  focusAnchor: null,
  focusStrength: 0,
  ritualExpand: 0,
  ritualActive: false,
});

export function ParticleInteractionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const signalsRef = useRef<ParticleSignals>(defaultSignals());

  const triggerBurst = useCallback(() => {
    signalsRef.current.burstTick += 1;
  }, []);

  const triggerFormation = useCallback((id: FormationId) => {
    const s = signalsRef.current;
    s.formation = id;
    s.formationStrength = 1;
  }, []);

  const releaseFormation = useCallback(() => {
    signalsRef.current.formationStrength = 0;
    window.setTimeout(() => {
      signalsRef.current.formation = null;
    }, 2800);
  }, []);

  const setFocusAnchor = useCallback((x: number | null, y: number | null) => {
    const s = signalsRef.current;
    if (x === null || y === null) {
      s.focusAnchor = null;
      s.focusStrength = 0;
      return;
    }
    s.focusAnchor = { x, y };
    s.focusStrength = 1;
  }, []);

  const setFocusFromElement = useCallback((el: HTMLElement | null) => {
    if (!el) {
      setFocusAnchor(null, null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setFocusAnchor(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }, [setFocusAnchor]);

  const triggerRitualTransition = useCallback(() => {
    const s = signalsRef.current;
    s.ritualActive = true;
    s.focusStrength = 0;
    s.focusAnchor = null;
    s.ritualExpand = 0;

    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        s.ritualExpand = 1;
      });
      window.setTimeout(() => {
        s.ritualExpand = 0.15;
        window.setTimeout(() => {
          s.ritualExpand = 0;
          s.ritualActive = false;
          resolve();
        }, 900);
      }, 720);
    });
  }, []);

  const value = useMemo(
    () => ({
      signalsRef,
      triggerBurst,
      triggerFormation,
      releaseFormation,
      setFocusAnchor,
      setFocusFromElement,
      triggerRitualTransition,
    }),
    [
      triggerBurst,
      triggerFormation,
      releaseFormation,
      setFocusAnchor,
      setFocusFromElement,
      triggerRitualTransition,
    ],
  );

  return (
    <ParticleInteractionContext.Provider value={value}>
      {children}
    </ParticleInteractionContext.Provider>
  );
}

export function useParticleInteraction() {
  const ctx = useContext(ParticleInteractionContext);
  const noopRef = useRef<ParticleSignals>(defaultSignals());
  if (!ctx) {
    return {
      signalsRef: noopRef,
      triggerBurst: () => {},
      triggerFormation: (_id: FormationId) => {},
      releaseFormation: () => {},
      setFocusAnchor: (_x: number | null, _y: number | null) => {},
      setFocusFromElement: (_el: HTMLElement | null) => {},
      triggerRitualTransition: () => Promise.resolve(),
    };
  }
  return ctx;
}
