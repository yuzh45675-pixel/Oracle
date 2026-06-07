import type { RitualPhase } from "@/types/tarot";

/** 仪式高密度阶段：压低背景 WebGL / 光效，把主线程让给卡背与翻牌 */
export function ritualPerformanceMode(
  phase: RitualPhase,
  allRevealed = true,
) {
  if (phase === "shuffling" || phase === "cutting") return true;
  if (phase === "spread" && !allRevealed) return true;
  return false;
}

/** 在浏览器空闲时再跑低优先级任务，避免与动画抢主线程 */
export function scheduleIdleTask(task: () => void, timeoutMs = 1800) {
  if (typeof window === "undefined") return;
  const ric = (
    window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    }
  ).requestIdleCallback;
  if (ric) {
    ric(task, { timeout: timeoutMs });
  } else {
    setTimeout(task, 0);
  }
}
