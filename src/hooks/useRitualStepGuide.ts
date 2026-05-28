"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadRitualStepGuideEnabled,
  saveRitualStepGuideEnabled,
} from "@/lib/ritual-guide-preference";

export function useRitualStepGuide() {
  const [enabled, setEnabledState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEnabledState(loadRitualStepGuideEnabled());
    setReady(true);
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    saveRitualStepGuideEnabled(value);
  }, []);

  return { enabled, setEnabled, ready };
}
