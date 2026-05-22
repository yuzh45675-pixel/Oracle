import type { FormationId } from "@/lib/themes";

/** Normalized 2D points in roughly -1..1 */
function sampleCircle(count: number, radius: number, cx = 0, cy = 0): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    pts.push([cx + Math.cos(t) * radius, cy + Math.sin(t) * radius]);
  }
  return pts;
}

function sampleArc(count: number, radius: number, start: number, end: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const t = start + ((end - start) * i) / Math.max(1, count - 1);
    pts.push([Math.cos(t) * radius, Math.sin(t) * radius * 0.85]);
  }
  return pts;
}

function sampleLine(count: number, x1: number, y1: number, x2: number, y2: number) {
  const pts: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const t = i / Math.max(1, count - 1);
    pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
  }
  return pts;
}

function sampleHexagram(): [number, number][] {
  const tri1 = sampleCircle(12, 0.55, 0, -0.08).map(([x, y]) => [x, y - 0.12] as [number, number]);
  const tri2 = sampleCircle(12, 0.55, 0, 0.08)
    .map(([x, y], i) => {
      const t = (i / 12) * Math.PI * 2 + Math.PI;
      return [Math.cos(t) * 0.55, Math.sin(t) * 0.55 + 0.12] as [number, number];
    });
  return [...tri1, ...tri2];
}

function sampleRose(petals: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < petals * 8; i++) {
    const t = (i / (petals * 8)) * Math.PI * 2;
    const r = 0.25 + Math.abs(Math.sin(petals * t)) * 0.45;
    pts.push([Math.cos(t) * r, Math.sin(t) * r]);
  }
  return pts;
}

function sampleZodiac(): [number, number][] {
  const outer = sampleCircle(36, 0.85);
  const inner = sampleCircle(24, 0.55);
  const spokes = Array.from({ length: 12 }, (_, i) => {
    const t = (i / 12) * Math.PI * 2;
    return [Math.cos(t) * 0.85, Math.sin(t) * 0.85] as [number, number];
  });
  return [...outer, ...inner, ...spokes];
}

function sampleWheel(): [number, number][] {
  const ring = sampleCircle(40, 0.75);
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const t = (i / 8) * Math.PI * 2;
    return sampleLine(6, 0, 0, Math.cos(t) * 0.75, Math.sin(t) * 0.75);
  }).flat();
  return [...ring, ...spokes];
}

function sampleEye(): [number, number][] {
  const lid = sampleArc(16, 0.7, Math.PI * 0.15, Math.PI * 0.85);
  const bottom = sampleArc(16, 0.7, -Math.PI * 0.85, -Math.PI * 0.15);
  const iris = sampleCircle(14, 0.22, 0, 0);
  return [...lid, ...bottom, ...iris];
}

function sampleSerpent(): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < 48; i++) {
    const t = i / 47;
    const x = (t - 0.5) * 1.6;
    const y = Math.sin(t * Math.PI * 3) * 0.35;
    pts.push([x, y]);
  }
  return pts;
}

function sampleAlchemy(): [number, number][] {
  const circle = sampleCircle(16, 0.5, 0, 0.15);
  const triangle = [
    [0, -0.55],
    [-0.48, 0.35],
    [0.48, 0.35],
  ].flatMap(([x, y], i) =>
    sampleLine(5, x, y, [[0, -0.55], [-0.48, 0.35], [0.48, 0.35], [0, -0.55]][(i + 1) % 3][0], [[0, -0.55], [-0.48, 0.35], [0.48, 0.35], [0, -0.55]][(i + 1) % 3][1])
  );
  return [...circle, ...triangle];
}

const BUILDERS: Record<Exclude<FormationId, "none">, () => [number, number][]> = {
  moon: () => [...sampleArc(20, 0.75, -Math.PI * 0.55, Math.PI * 0.55), ...sampleCircle(8, 0.18, -0.22, 0.05)],
  venus: () => [
    ...sampleCircle(20, 0.45, 0, 0.12),
    ...sampleLine(10, -0.35, -0.05, 0.35, -0.05),
    ...sampleLine(10, 0, -0.05, 0, -0.55),
  ],
  rose: () => sampleRose(5),
  "heart-rune": () => {
    const left = sampleArc(10, 0.35, Math.PI, Math.PI * 1.5);
    const right = sampleArc(10, 0.35, Math.PI * 1.5, Math.PI * 2);
    const point = sampleLine(8, -0.35, 0, 0, -0.55).concat(sampleLine(8, 0.35, 0, 0, -0.55));
    return [...left.map(([x, y]) => [x - 0.15, y + 0.1] as [number, number]), ...right.map(([x, y]) => [x + 0.15, y + 0.1] as [number, number]), ...point];
  },
  zodiac: sampleZodiac,
  hexagram: sampleHexagram,
  wheel: sampleWheel,
  alchemy: sampleAlchemy,
  eye: sampleEye,
  serpent: sampleSerpent,
};

/** Build target XY for each particle index */
export function buildFormationTargets(
  formation: FormationId,
  particleCount: number,
): Float32Array {
  const out = new Float32Array(particleCount * 2);
  if (formation === "none") {
    for (let i = 0; i < particleCount; i++) {
      out[i * 2] = (Math.random() - 0.5) * 0.001;
      out[i * 2 + 1] = (Math.random() - 0.5) * 0.001;
    }
    return out;
  }

  const shape = BUILDERS[formation]();
  for (let i = 0; i < particleCount; i++) {
    const p = shape[i % shape.length];
    const jitter = 0.04;
    out[i * 2] = p[0] + (Math.random() - 0.5) * jitter;
    out[i * 2 + 1] = p[1] + (Math.random() - 0.5) * jitter;
  }
  return out;
}

export function pickFormation(formations: FormationId[]): FormationId {
  const pool = formations.filter((f) => f !== "none");
  if (pool.length === 0) return "none";
  return pool[Math.floor(Math.random() * pool.length)]!;
}

/** Cut groups: 3 cards → 24 piles, 6 → 12 */
export function cutGroupCount(spreadCardCount: number): number {
  const n = Math.max(1, spreadCardCount);
  return Math.max(3, Math.round(72 / n));
}
