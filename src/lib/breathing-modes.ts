export type BreathingModeId =
  | "478"
  | "box"
  | "deep"
  | "moon"
  | "energy"
  | "balance";

export type BreathPhase = "inhale" | "hold1" | "exhale" | "hold2";

export interface BreathingMode {
  id: BreathingModeId;
  name: string;
  subtitle: string;
  rhythm: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
  /** 粒子漂移强度 0–1 */
  drift: number;
  /** 呼吸幅度 0–1 */
  amplitude: number;
}

export const BREATHING_MODES: BreathingMode[] = [
  {
    id: "478",
    name: "4-7-8 呼吸",
    subtitle: "放松 · 缓解焦虑",
    rhythm: "吸 4s · 停 7s · 呼 8s",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 3,
    drift: 0.35,
    amplitude: 1,
  },
  {
    id: "box",
    name: "Box Breathing",
    subtitle: "稳定情绪 · 集中注意力",
    rhythm: "4-4-4-4 盒式呼吸",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    cycles: 4,
    drift: 0.3,
    amplitude: 1,
  },
  {
    id: "deep",
    name: "深度呼吸",
    subtitle: "缓慢均匀 · 沉浸放空",
    rhythm: "吸 5s · 呼 6s",
    inhale: 5,
    hold1: 2,
    exhale: 6,
    hold2: 2,
    cycles: 3,
    drift: 0.28,
    amplitude: 1,
  },
  {
    id: "moon",
    name: "月光呼吸",
    subtitle: "更柔和 · 情绪疗愈",
    rhythm: "吸 5s · 停 3s · 呼 7s",
    inhale: 5,
    hold1: 3,
    exhale: 7,
    hold2: 3,
    cycles: 3,
    drift: 0.22,
    amplitude: 1,
  },
  {
    id: "energy",
    name: "能量呼吸",
    subtitle: "节奏略快 · 增强进入感",
    rhythm: "吸 3s · 呼 3s",
    inhale: 3,
    hold1: 1,
    exhale: 3,
    hold2: 1,
    cycles: 4,
    drift: 0.48,
    amplitude: 1,
  },
  {
    id: "balance",
    name: "平衡呼吸",
    subtitle: "吸呼等长 · 进入稳定",
    rhythm: "吸 4s · 呼 4s",
    inhale: 4,
    hold1: 0,
    exhale: 4,
    hold2: 0,
    cycles: 4,
    drift: 0.32,
    amplitude: 1,
  },
];

export const BREATH_PHASE_LABEL: Record<BreathPhase, string> = {
  inhale: "吸气",
  hold1: "停留",
  exhale: "呼气",
  hold2: "停留",
};

export function getBreathingMode(id: BreathingModeId): BreathingMode {
  return BREATHING_MODES.find((m) => m.id === id) ?? BREATHING_MODES[5]!;
}

export function phaseDuration(
  mode: BreathingMode,
  phase: BreathPhase,
): number {
  return mode[phase];
}

export function nextPhase(
  mode: BreathingMode,
  phase: BreathPhase,
): BreathPhase | "done" {
  const order: BreathPhase[] = ["inhale", "hold1", "exhale", "hold2"];
  const idx = order.indexOf(phase);
  for (let i = idx + 1; i < order.length; i++) {
    const p = order[i]!;
    if (mode[p] > 0) return p;
  }
  return "done";
}

/** 0 = 呼气末，1 = 吸气末 */
export function breathAmount(phase: BreathPhase, t: number): number {
  const eased = 0.5 - 0.5 * Math.cos(Math.min(1, Math.max(0, t)) * Math.PI);
  switch (phase) {
    case "inhale":
      return eased;
    case "hold1":
      return 1;
    case "exhale":
      return 1 - eased;
    case "hold2":
      return 0;
  }
}

export function holdTremble(phase: BreathPhase, time: number): number {
  if (phase !== "hold1" && phase !== "hold2") return 0;
  return 0.04 + 0.03 * Math.sin(time * 8);
}
