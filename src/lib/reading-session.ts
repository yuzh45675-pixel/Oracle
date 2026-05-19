import type { SpreadType } from "@/types/tarot";
import type { LenormandSpreadType } from "@/types/lenormand";

const KEY = "oracle_reading_setup";

export type ReadingSetup =
  | { deck: "waite"; spread: SpreadType; question?: string }
  | { deck: "lenormand"; spread: LenormandSpreadType; question?: string };

export function saveReadingSetup(setup: ReadingSetup): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(setup));
}

export function loadReadingSetup(): ReadingSetup | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ReadingSetup;
  } catch {
    return null;
  }
}

export function clearReadingSetup(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
