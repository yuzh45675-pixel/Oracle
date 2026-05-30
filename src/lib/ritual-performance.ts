/** 仪式阶段性能：滑动选牌等高密度卡背场景 */

import type { RitualPhase } from "@/types/tarot";

export type CardBackDetail = "full" | "static" | "lite";

export const SCROLL_CARD_STRIDE = {
  xs: 74 + 10,
  sm: 96 + 14,
} as const;

export const SCROLL_VIRTUAL_BUFFER = 4;

/** 滑动选牌行内同时挂载的最大卡背数量（含缓冲） */
export function scrollVisibleWindow(
  scrollLeft: number,
  viewportWidth: number,
  total: number,
  stride: number,
  buffer = SCROLL_VIRTUAL_BUFFER,
) {
  const start = Math.max(0, Math.floor(scrollLeft / stride) - buffer);
  const visible = Math.ceil(viewportWidth / stride) + 1;
  const end = Math.min(total, start + visible + buffer * 2);
  return { start, end };
}

export function ritualParticleIntensity(performanceMode: boolean) {
  return performanceMode ? 0.42 : 1;
}

export function ritualParticleDissolve(phase: RitualPhase) {
  if (phase === "spread" || phase === "complete") return 1;
  if (phase === "cutting") return 0.5;
  return 0.75;
}
