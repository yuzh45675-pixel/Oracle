import type { DeckType, SpreadType } from "@/types/tarot";
import type { LenormandSpreadType } from "@/types/lenormand";

const KEY = "oracle_reading_setup";

export type ReadingSetup =
  | { deck: "waite"; spread: SpreadType; question?: string }
  | { deck: "lenormand"; spread: LenormandSpreadType; question?: string }
  | { deck: DeckType; mode: "free"; cardCount: number; question?: string };

/** 是否为「不选牌阵直接测算」自由抽牌模式 */
export function isFreeSetup(
  setup: ReadingSetup | null,
): setup is { deck: DeckType; mode: "free"; cardCount: number; question?: string } {
  return Boolean(setup && "mode" in setup && setup.mode === "free");
}

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
