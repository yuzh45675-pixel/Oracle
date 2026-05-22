"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FormationId } from "@/lib/themes";

interface FocusAnchor {
  x: number;
  y: number;
}

interface ParticleInteractionValue {
  burstStrength: number;
  formation: FormationId | null;
  formationStrength: number;
  focusAnchor: FocusAnchor | null;
  focusStrength: number;
  ritualExpand: number;
  ritualActive: boolean;
  triggerBurst: () => void;
  triggerFormation: (id: FormationId) => void;
  releaseFormation: () => void;
  setFocusAnchor: (x: number | null, y: number | null) => void;
  setFocusFromElement: (el: HTMLElement | null) => void;
  triggerRitualTransition: () => Promise<void>;
}

const ParticleInteractionContext =
  createContext<ParticleInteractionValue | null>(null);

export function ParticleInteractionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [burstStrength, setBurstStrength] = useState(0);
  const [formation, setFormation] = useState<FormationId | null>(null);
  const [formationStrength, setFormationStrength] = useState(0);
  const [focusAnchor, setFocusAnchorState] = useState<FocusAnchor | null>(
    null,
  );
  const [focusStrength, setFocusStrength] = useState(0);
  const [ritualExpand, setRitualExpand] = useState(0);
  const [ritualActive, setRitualActive] = useState(false);

  const triggerBurst = useCallback(() => {
    setBurstStrength(1);
    window.setTimeout(() => setBurstStrength(0), 150);
  }, []);

  const triggerFormation = useCallback((id: FormationId) => {
    setFormation(id);
    setFormationStrength(1);
  }, []);

  const releaseFormation = useCallback(() => {
    setFormationStrength(0);
    window.setTimeout(() => setFormation(null), 2800);
  }, []);

  const setFocusAnchor = useCallback((x: number | null, y: number | null) => {
    if (x === null || y === null) {
      setFocusAnchorState(null);
      setFocusStrength(0);
      return;
    }
    setFocusAnchorState({ x, y });
    setFocusStrength(1);
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
    setRitualActive(true);
    setFocusStrength(0);
    setFocusAnchorState(null);
    setRitualExpand(0);

    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => setRitualExpand(1));
      window.setTimeout(() => {
        setRitualExpand(0.15);
        window.setTimeout(() => {
          setRitualExpand(0);
          setRitualActive(false);
          resolve();
        }, 900);
      }, 720);
    });
  }, []);

  const value = useMemo(
    () => ({
      burstStrength,
      formation,
      formationStrength,
      focusAnchor,
      focusStrength,
      ritualExpand,
      ritualActive,
      triggerBurst,
      triggerFormation,
      releaseFormation,
      setFocusAnchor,
      setFocusFromElement,
      triggerRitualTransition,
    }),
    [
      burstStrength,
      formation,
      formationStrength,
      focusAnchor,
      focusStrength,
      ritualExpand,
      ritualActive,
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
  if (!ctx) {
    return {
      burstStrength: 0,
      formation: null as FormationId | null,
      formationStrength: 0,
      focusAnchor: null,
      focusStrength: 0,
      ritualExpand: 0,
      ritualActive: false,
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
