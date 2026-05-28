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

/** 按 id 插入或更新，避免同一次占卜重复占多条 */
export function upsertReading(session: ReadingSession): void {
  if (typeof window === "undefined") return;
  const history = loadHistory();
  const idx = history.findIndex((s) => s.id === session.id);
  let next: ReadingSession[];
  if (idx >= 0) {
    next = [...history];
    next[idx] = { ...history[idx], ...session };
  } else {
    next = [session, ...history];
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(0, MAX_HISTORY)));
}

/** @deprecated 请使用 upsertReading */
export function saveReading(session: ReadingSession): void {
  upsertReading(session);
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}
