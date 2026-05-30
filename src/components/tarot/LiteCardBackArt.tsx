import type { OracleTheme } from "@/lib/themes";

const W = 300;
const H = 440;
const CX = 150;
const CY = 212;

/** 滑动选牌等高密度场景：保留眼睛与星芒轮廓，去掉动画与多层轨道 */
export function LiteCardBackArt({ theme }: { theme: OracleTheme }) {
  const line = theme.colors.accentSoft;
  const bright = theme.colors.metal;
  const rayCount = 32;

  const rays = Array.from({ length: rayCount }, (_, i) => {
    const a = (i / rayCount) * Math.PI * 2 - Math.PI / 2;
    const inner = 28;
    const outer = i % 4 === 0 ? 118 : 102;
    return {
      x1: CX + inner * Math.cos(a),
      y1: CY + inner * Math.sin(a),
      x2: CX + outer * Math.cos(a),
      y2: CY + outer * Math.sin(a),
      op: i % 4 === 0 ? 0.42 : 0.22,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <rect
        x={12}
        y={12}
        width={W - 24}
        height={H - 24}
        rx={14}
        fill="none"
        stroke={line}
        strokeWidth={0.55}
        opacity={0.55}
      />
      <ellipse
        cx={CX}
        cy={CY}
        rx={122}
        ry={200}
        fill="none"
        stroke={line}
        strokeWidth={0.45}
        opacity={0.38}
      />
      <ellipse
        cx={CX}
        cy={CY}
        rx={90}
        ry={148}
        fill="none"
        stroke={line}
        strokeWidth={0.4}
        opacity={0.32}
      />
      <ellipse
        cx={CX}
        cy={CY}
        rx={64}
        ry={104}
        fill="none"
        stroke={line}
        strokeWidth={0.35}
        opacity={0.28}
      />
      {rays.map((r, i) => (
        <line
          key={i}
          x1={r.x1}
          y1={r.y1}
          x2={r.x2}
          y2={r.y2}
          stroke={line}
          strokeWidth={i % 4 === 0 ? 0.5 : 0.32}
          opacity={r.op}
        />
      ))}
      <circle
        cx={CX}
        cy={CY}
        r={20.5}
        fill="none"
        stroke={bright}
        strokeWidth={0.55}
        opacity={0.72}
      />
      <circle
        cx={CX}
        cy={CY}
        r={12}
        fill="none"
        stroke={bright}
        strokeWidth={0.5}
        opacity={0.65}
      />
      <path
        d={`M ${CX - 8.4} ${CY} A 8.4 8.4 0 1 1 ${CX + 2.2} ${CY} A 6.2 6.2 0 1 0 ${CX - 8.4} ${CY}`}
        fill={bright}
        opacity={0.78}
      />
      {[
        [24, 24],
        [W - 24, 24],
        [24, H - 24],
        [W - 24, H - 24],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`} opacity={0.45}>
          <path
            d="M0 -3.2 L0.9 0 L0 3.2 L-0.9 0 Z M-3.2 0 L0 -0.9 L3.2 0 L0 0.9 Z"
            fill={line}
          />
        </g>
      ))}
    </svg>
  );
}
