"use client";

import { useEffect, useRef, useState } from "react";
import {
  breathAmount,
  holdTremble,
  type BreathPhase,
  type BreathingMode,
} from "@/lib/breathing-modes";

interface BreathCycleState {
  phase: BreathPhase;
  phaseProgress: number;
  breath: number;
  tremble: number;
  cycleIndex: number;
  finished: boolean;
}

export function useBreathCycle(mode: BreathingMode, active: boolean): BreathCycleState {
  const [phase, setPhase] = useState<BreathPhase>("inhale");
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [tremble, setTremble] = useState(0);
  const startRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      setPhase("inhale");
      setPhaseProgress(0);
      setCycleIndex(0);
      setFinished(false);
      setTremble(0);
      return;
    }

    setPhase("inhale");
    setPhaseProgress(0);
    setCycleIndex(0);
    setFinished(false);
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startRef.current) / 1000;
      let t = elapsed;
      let currentPhase: BreathPhase = "inhale";
      let cycle = 0;

      outer: for (let c = 0; c < mode.cycles; c++) {
        const seq: BreathPhase[] = ["inhale", "hold1", "exhale", "hold2"];
        for (const p of seq) {
          const dur = mode[p];
          if (dur <= 0) continue;
          if (t < dur) {
            currentPhase = p;
            cycle = c;
            setPhase(p);
            setPhaseProgress(t / dur);
            setCycleIndex(c);
            setTremble(holdTremble(p, elapsed));
            rafRef.current = requestAnimationFrame(tick);
            return;
          }
          t -= dur;
        }
      }

      setFinished(true);
      setPhaseProgress(1);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, mode]);

  const breath = breathAmount(phase, phaseProgress);

  return { phase, phaseProgress, breath, tremble, cycleIndex, finished };
}
