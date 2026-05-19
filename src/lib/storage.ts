import type { ReadingSession } from "@/types/tarot";

const HISTORY_KEY = "oracle_reading_history";
const MAX_HISTORY = 24;

export function loadHistory(): ReadingSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReadingSession[];
  } catch {
    return [];
  }
}

export function saveReading(session: ReadingSession): void {
  if (typeof window === "undefined") return;
  const history = loadHistory();
  const next = [session, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}
