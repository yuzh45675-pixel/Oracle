"use client";

import { useReducedMotion } from "framer-motion";
import { useId, type ReactNode } from "react";
import type { OracleTheme } from "@/lib/themes";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";

interface OracleEyeCardBackArtProps {
  theme: OracleTheme;
  /** 入口 hero：同心圆环绕眼睛缓慢自转 */
  orbitSpin?: boolean;
  /** 仪式/选牌：完整线稿，射线不精简 */
  highDetail?: boolean;
}

const W = 300;
const H = 440;
const CX = 150;
const CY = 212;

function r2(n: number) {
  return Math.round(n * 100) / 100;
}

const EYE_RING_R = 12;
/** 虹膜半径 — 环形光内缘镂空 */
const EYE_IRIS_R = 8.4;
const EYE_RING_GLOW_R = EYE_RING_R + 9;
const EYE_MAIN_R = 20.5;
/** 从外向内数，倒数第二个正圆（虹膜 r=8.4 为最内） */
const EYE_SECOND_INNER_R = 12;

function ringArcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const x1 = r2(cx + r * Math.cos(rad(startDeg)));
  const y1 = r2(cy + r * Math.sin(rad(startDeg)));
  const x2 = r2(cx + r * Math.cos(rad(endDeg)));
  const y2 = r2(cy + r * Math.sin(rad(endDeg)));
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  const sweep = endDeg > startDeg ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} ${sweep} ${x2} ${y2}`;
}

/** 竖列四芒星外端落在的正圆（内侧左转 / 外侧右转分界） */
const ORBIT_SPLIT_R = 64;

const LARGE_ELLIPSE_RX = 122;
const LARGE_ELLIPSE_RY = 200;
/** 外侧右转参考正圆 r=90 */
const CW_RING_R = 90;
const CW_RING_OP = 0.6;
const CW_RING_SW = 0.45;
/** 大椭圆与右转正圆之间的中点椭圆 */
const MID_ELLIPSE_RX = (LARGE_ELLIPSE_RX + CW_RING_R) / 2;
const MID_ELLIPSE_RY = (LARGE_ELLIPSE_RY + CW_RING_R) / 2;
/** 过渡椭圆亮度与最亮右转正圆 (r=90) 完全一致 */
const MID_ELLIPSE_OP = CW_RING_OP;
const MID_ELLIPSE_SW = CW_RING_SW;

const TRANSITION_OVALS = [
  [116, 188, 0.32, 0.34],
  [108, 175, 0.3, 0.32],
  [100, 162, 0.28, 0.3],
  [92, 149, 0.28, 0.28],
  [84, 136, 0.26, 0.26],
  [76, 123, 0.26, 0.24],
  [68, 110, 0.24, 0.22],
  [58, 94, 0.24, 0.2],
  [50, 81, 0.22, 0.18],
  [42, 68, 0.22, 0.16],
] as const;

const MID_OVAL_INDEX = TRANSITION_OVALS.reduce((best, [rx, ry], i) => {
  const d = (rx - MID_ELLIPSE_RX) ** 2 + (ry - MID_ELLIPSE_RY) ** 2;
  return d < best.d ? { i, d } : best;
}, { i: 0, d: Number.POSITIVE_INFINITY }).i;

const CORNER_STAR_POSITIONS: Array<[number, number]> = [
  [20, 20],
  [W - 20, 20],
  [20, H - 20],
  [W - 20, H - 20],
];

/** 最亮大椭圆（rx=122）四向端点四芒星 */
const ELLIPSE_CORNER_STAR_POSITIONS: Array<[number, number]> = [
  [CX, CY - LARGE_ELLIPSE_RY],
  [CX + LARGE_ELLIPSE_RX, CY],
  [CX, CY + LARGE_ELLIPSE_RY],
  [CX - LARGE_ELLIPSE_RX, CY],
];

/** 椭圆轨道上的四芒星 — 各轨大小不一、转速不同（外侧轨略大、略快） */
const ELLIPTICAL_STAR_ORBITS = [
  {
    rx: 118,
    ry: 194,
    tilt: -11,
    durationSec: 148,
    trailOp: 0.13,
    stars: [
      { angleDeg: 32, size: 3.05, op: 0.5 },
      { angleDeg: 158, size: 1.52, op: 0.34 },
      { angleDeg: 248, size: 2.35, op: 0.42 },
    ],
  },
  {
    rx: 100,
    ry: 164,
    tilt: 15,
    durationSec: 116,
    trailOp: 0.11,
    stars: [
      { angleDeg: 78, size: 2.1, op: 0.4 },
      { angleDeg: 205, size: 2.75, op: 0.46 },
      { angleDeg: 315, size: 1.28, op: 0.3 },
    ],
  },
  {
    rx: 84,
    ry: 136,
    tilt: -7,
    durationSec: 112,
    trailOp: 0.1,
    stars: [
      { angleDeg: 118, size: 1.45, op: 0.36 },
      { angleDeg: 292, size: 2.15, op: 0.41 },
    ],
  },
  {
    rx: 72,
    ry: 114,
    tilt: 22,
    durationSec: 98,
    trailOp: 0.09,
    stars: [
      { angleDeg: 48, size: 1.25, op: 0.32 },
      { angleDeg: 188, size: 1.75, op: 0.38 },
      { angleDeg: 332, size: 1.05, op: 0.28 },
    ],
  },
  {
    rx: 108,
    ry: 176,
    tilt: 6,
    durationSec: 128,
    trailOp: 0.12,
    stars: [
      { angleDeg: 12, size: 1.72, op: 0.35 },
      { angleDeg: 142, size: 2.6, op: 0.44 },
    ],
  },
] as const;

function ellipsePoint(rx: number, ry: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  return {
    x: r2(CX + rx * Math.cos(a)),
    y: r2(CY + ry * Math.sin(a)),
  };
}

/** 单条椭圆轨道 + 公转四芒星（逆时针） */
function EllipseStarOrbit({
  enabled,
  rx,
  ry,
  tilt,
  durationSec,
  trailOp,
  stars,
  renderStar,
  line,
}: {
  enabled: boolean;
  rx: number;
  ry: number;
  tilt: number;
  durationSec: number;
  trailOp: number;
  stars: ReadonlyArray<{ angleDeg: number; size: number; op: number }>;
  renderStar: (x: number, y: number, size: number, op: number) => ReactNode;
  line: string;
}) {
  return (
    <g transform={`rotate(${tilt} ${CX} ${CY})`}>
      <g>
        {enabled && (
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from={`360 ${CX} ${CY}`}
            to={`0 ${CX} ${CY}`}
            dur={`${durationSec}s`}
            repeatCount="indefinite"
          />
        )}
        <ellipse
          cx={CX}
          cy={CY}
          rx={rx}
          ry={ry}
          fill="none"
          stroke={line}
          strokeWidth="0.22"
          opacity={trailOp}
          strokeDasharray="1.5 3.2"
        />
        {stars.map((s, i) => {
          const p = ellipsePoint(rx, ry, s.angleDeg);
          return <g key={`es-${rx}-${i}`}>{renderStar(p.x, p.y, s.size, s.op)}</g>;
        })}
      </g>
    </g>
  );
}

/** 星系式缓慢自转（绕眼睛中心） */
function GalaxyOrbitSpin({
  enabled,
  children,
  durationSec = 108,
  direction = "cw",
}: {
  enabled: boolean;
  children: ReactNode;
  durationSec?: number;
  /** cw=顺时针（向右），ccw=逆时针（向左） */
  direction?: "cw" | "ccw";
}) {
  if (!enabled) return <g>{children}</g>;
  const from = direction === "cw" ? `0 ${CX} ${CY}` : `360 ${CX} ${CY}`;
  const to = direction === "cw" ? `360 ${CX} ${CY}` : `0 ${CX} ${CY}`;
  return (
    <g>
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from={from}
        to={to}
        dur={`${durationSec}s`}
        repeatCount="indefinite"
      />
      {children}
    </g>
  );
}

/**
 * 复刻桌面「塔罗卡背设计」（ARCANA ARCHIVE）：
 * 黑底 + 单色辐射星图 + 中央全知之眼。线描色相由当前主题 metal/accent 驱动，
 * 银主题接近原稿，黑粉主题则呈玫瑰金线描。
 */
export function OracleEyeCardBackArt({ theme, orbitSpin = false, highDetail = false }: OracleEyeCardBackArtProps) {
  const uid = useId().replace(/:/g, "");
  const reducedMotion = useReducedMotion();
  const isTouch = useIsTouchDevice();
  const spin = orbitSpin && !reducedMotion;
  const rayCount = highDetail || !isTouch ? 96 : 64;
  const c = theme.colors;
  const line = c.metal;
  const lineDim = c.accentDim;
  const bright = c.accentSoft;
  const glow = c.accent;

  // 中央辐射光线（疏密交替，每 8 根加长形成主轴）
  const rays = Array.from({ length: rayCount }, (_, i) => {
    const a = (i / rayCount) * Math.PI * 2 - Math.PI / 2;
    const inner = EYE_RING_R;
    const outer = i % 8 === 0 ? 96 : i % 2 === 0 ? 84 : 56;
    const w = i % 8 === 0 ? 0.6 : i % 2 === 0 ? 0.42 : 0.3;
    return {
      x1: r2(CX + Math.cos(a) * inner),
      y1: r2(CY + Math.sin(a) * inner),
      x2: r2(CX + Math.cos(a) * outer),
      y2: r2(CY + Math.sin(a) * outer),
      w,
    };
  });

  const dotsOnCircle = (r: number, count: number, dotR: number, op: number) =>
    Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;
      return { cx: r2(CX + Math.cos(a) * r), cy: r2(CY + Math.sin(a) * r), dotR, op };
    });

  const dialTicks = Array.from({ length: 96 }, (_, i) => {
    const a = (i / 96) * Math.PI * 2;
    const long = i % 8 === 0;
    const ri = long ? 81 : 84;
    return {
      x1: r2(CX + Math.cos(a) * ri),
      y1: r2(CY + Math.sin(a) * ri),
      x2: r2(CX + Math.cos(a) * 90),
      y2: r2(CY + Math.sin(a) * 90),
    };
  });

  /** 眼睛主圈轨道点 */
  const eyeOrbitDots = (r: number, count: number) =>
    Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;
      return { cx: r2(CX + Math.cos(a) * r), cy: r2(CY + Math.sin(a) * r) };
    });

  /** 眼睛四向四芒星 */
  const eyeCardinalStars: Array<[number, number, number, number]> = [
    [CX, CY - EYE_MAIN_R, 3.2, 0.82],
    [CX + EYE_MAIN_R, CY, 3.2, 0.82],
    [CX, CY + EYE_MAIN_R, 3.2, 0.82],
    [CX - EYE_MAIN_R, CY, 3.2, 0.82],
  ];

  /** 中央竖列四芒星（大小不一，外端落在 r=64 正圆上） */
  const eyeColumnStars: Array<[number, number, number, number]> = [
    [CX, CY - 64, 2.6, 0.55],
    [CX, CY - 44, 1.5, 0.42],
    [CX, CY - 32, 2.2, 0.5],
    [CX, CY + 32, 2.4, 0.48],
    [CX, CY + 44, 1.7, 0.4],
    [CX, CY + 64, 2.9, 0.52],
  ];

  const star = (x: number, y: number, r: number, op = 0.6) => {
    const r2v = r * 0.26;
    return (
      <path
        d={`M${r2(x)} ${r2(y - r)} L${r2(x + r2v)} ${r2(y - r2v)} L${r2(x + r)} ${r2(y)} L${r2(
          x + r2v,
        )} ${r2(y + r2v)} L${r2(x)} ${r2(y + r)} L${r2(x - r2v)} ${r2(y + r2v)} L${r2(x - r)} ${r2(
          y,
        )} L${r2(x - r2v)} ${r2(y - r2v)} Z`}
        fill={bright}
        opacity={op}
      />
    );
  };

  /** 四芒星 — 纯色描边 */
  const starStroke = (x: number, y: number, r: number, op = 0.7, sw = 0.38) => {
    const r2v = r * 0.26;
    return (
      <path
        d={`M${r2(x)} ${r2(y - r)} L${r2(x + r2v)} ${r2(y - r2v)} L${r2(x + r)} ${r2(y)} L${r2(
          x + r2v,
        )} ${r2(y + r2v)} L${r2(x)} ${r2(y + r)} L${r2(x - r2v)} ${r2(y + r2v)} L${r2(x - r)} ${r2(
          y,
        )} L${r2(x - r2v)} ${r2(y - r2v)} Z`}
        fill="none"
        stroke={bright}
        strokeWidth={sw}
        opacity={op}
      />
    );
  };

  const crescent = (x: number, y: number, r: number) => (
    <path
      d={`M${r2(x - r)} ${r2(y)} A${r} ${r} 0 1 1 ${r2(x + r)} ${r2(
        y,
      )} A${r2(r * 0.78)} ${r2(r * 0.78)} 0 1 0 ${r2(x - r)} ${r2(y)} Z`}
      fill="none"
      stroke={line}
      strokeWidth="0.4"
      opacity="0.6"
    />
  );

  const orbitArc = (yBase: number, dir: number) =>
    Array.from({ length: 9 }, (_, i) => {
      const t = i / 8;
      const x = 60 + t * 180;
      const dx = (x - CX) / 90;
      const y = yBase + dir * (1 - dx * dx) * -10;
      return { x: r2(x), y: r2(y), r: i === 4 ? 3 : 2 };
    });

  const scatter: Array<[number, number, number]> = [
    [60, 70, 3],
    [240, 70, 3],
    [52, 150, 2],
    [248, 150, 2],
    [70, 300, 2.4],
    [230, 300, 2.4],
    [60, 370, 3],
    [240, 370, 3],
    [150, 96, 2],
    [150, 330, 2],
    [110, 120, 1.6],
    [190, 120, 1.6],
    [110, 305, 1.6],
    [190, 305, 1.6],
  ];

  /** 眼睛周围低调星点 */
  const eyeStars = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2 + 0.35;
    const r = 26 + (i % 2) * 3;
    return {
      x: r2(CX + Math.cos(a) * r),
      y: r2(CY + Math.sin(a) * r),
      size: i % 2 === 0 ? 1 : 0.8,
      op: 0.2,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="absolute inset-0 h-full w-full"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient
          id={`${uid}-ring-glow`}
          gradientUnits="userSpaceOnUse"
          cx={CX}
          cy={CY}
          r={EYE_RING_GLOW_R}
        >
          <stop offset="0%" stopColor={bright} stopOpacity="0" />
          <stop offset={`${r2((EYE_IRIS_R / EYE_RING_GLOW_R) * 100)}%`} stopColor={bright} stopOpacity="0" />
          <stop offset={`${r2((EYE_RING_R / EYE_RING_GLOW_R) * 100)}%`} stopColor={bright} stopOpacity="0.4" />
          <stop offset={`${r2(((EYE_RING_R + 4) / EYE_RING_GLOW_R) * 100)}%`} stopColor={glow} stopOpacity="0.1" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <mask id={`${uid}-ring-glow-mask`}>
          <rect width={W} height={H} fill="white" />
          <circle cx={CX} cy={CY} r={EYE_IRIS_R} fill="black" />
        </mask>
        <linearGradient id={`${uid}-holo`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c8d8f0" stopOpacity="0.95" />
          <stop offset="22%" stopColor="#f8fbff" stopOpacity="1" />
          <stop offset="42%" stopColor="#e8d4ff" stopOpacity="0.92" />
          <stop offset="58%" stopColor="#fff6e0" stopOpacity="0.9" />
          <stop offset="78%" stopColor="#d4f0ff" stopOpacity="0.95" />
          <stop offset="100%" stopColor={line} stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={`${uid}-shine`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={bright} stopOpacity="0.95" />
          <stop offset="45%" stopColor={line} stopOpacity="0.8" />
          <stop offset="100%" stopColor={lineDim} stopOpacity="0.55" />
        </linearGradient>
        <filter id={`${uid}-sg`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.55" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${uid}-soft-ring`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="1.3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 外框双边框 + 内框 */}
      <rect
        x="9"
        y="9"
        width={W - 18}
        height={H - 18}
        rx="14"
        fill="none"
        stroke={`url(#${uid}-holo)`}
        strokeWidth="0.7"
        opacity="0.70"
      />
      <rect
        x="12"
        y="12"
        width={W - 24}
        height={H - 24}
        rx="12.5"
        fill="none"
        stroke={`url(#${uid}-holo)`}
        strokeWidth="0.7"
        opacity="0.70"
      />
      <rect
        x="14"
        y="14"
        width={W - 28}
        height={H - 28}
        rx="11"
        fill="none"
        stroke={line}
        strokeWidth="0.35"
        opacity="0.4"
      />

      {/* 牌框四角星饰 — 发光描边，始终静止 */}
      {CORNER_STAR_POSITIONS.map(([x, y], i) => (
        <g key={`corner-${i}`} filter={`url(#${uid}-sg)`}>
          {starStroke(x, y, 5.8, 0.88, 0.46)}
          <circle cx={x} cy={y} r="8.5" fill="none" stroke={line} strokeWidth="0.3" opacity="0.4" />
        </g>
      ))}

      {/* 大椭圆四向亮星 — 非 hero 时静止 */}
      {!orbitSpin &&
        ELLIPSE_CORNER_STAR_POSITIONS.map(([x, y], i) => (
          <g key={`ell-corner-${i}`}>{star(x, y, 4, 0.7)}</g>
        ))}

      {/* 顶部太阳 + 土星 + 两侧月牙 */}
      <g transform={`translate(${CX} 34)`} opacity="0.7">
        <circle r="3.2" fill="none" stroke={bright} strokeWidth="0.5" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line
              key={`sun-${i}`}
              x1={r2(Math.cos(a) * 5)}
              y1={r2(Math.sin(a) * 5)}
              x2={r2(Math.cos(a) * 8)}
              y2={r2(Math.sin(a) * 8)}
              stroke={bright}
              strokeWidth="0.4"
            />
          );
        })}
      </g>
      <g transform={`translate(${CX} 46)`} opacity="0.55">
        <circle r="2.8" fill="none" stroke={line} strokeWidth="0.4" />
        <line x1="0" y1="2.8" x2="0" y2="6.2" stroke={line} strokeWidth="0.35" />
        <path d="M-4.2 6.2 Q0 8.8 4.2 6.2" fill="none" stroke={line} strokeWidth="0.35" />
      </g>
      {crescent(CX - 26, 36, 3.5)}
      {crescent(CX + 26, 36, 3.5)}

      {/* 大椭圆框 */}
      <ellipse
        cx={CX}
        cy={CY}
        rx="122"
        ry="200"
        fill="none"
        stroke={line}
        strokeWidth="0.5"
        opacity="0.5"
      />
      <ellipse
        cx={CX}
        cy={CY}
        rx="130"
        ry="210"
        fill="none"
        stroke={line}
        strokeWidth="0.3"
        opacity="0.3"
      />

      {/* 大椭圆与最亮右转正圆 (r=90) 之间的过渡椭圆（亮度与正圆完全一致，只保留一个） */}
      {(() => {
        const trans = TRANSITION_OVALS.find(([rx]) => rx > 92 && rx < 115) || TRANSITION_OVALS[1];
        return (
          <ellipse
            cx={CX}
            cy={CY}
            rx={trans[0]}
            ry={trans[1]}
            fill="none"
            stroke={line}
            strokeWidth={MID_ELLIPSE_SW}
            opacity={MID_ELLIPSE_OP}
          />
        );
      })()}

      {/* 椭圆轨道四芒星 — 各轨公转（仅入口 hero） */}
      {orbitSpin &&
        ELLIPTICAL_STAR_ORBITS.map((orbit, i) => (
          <EllipseStarOrbit
            key={`ell-orbit-${i}`}
            enabled={spin}
            rx={orbit.rx}
            ry={orbit.ry}
            tilt={orbit.tilt}
            durationSec={orbit.durationSec}
            trailOp={orbit.trailOp}
            stars={orbit.stars}
            line={line}
            renderStar={(x, y, size, op) => starStroke(x, y, size, op, 0.34)}
          />
        ))}

      {/* 上下轨道弧 */}
      {orbitArc(118, 1).map((d, i) => (
        <circle
          key={`oa-t-${i}`}
          cx={d.x}
          cy={d.y}
          r={d.r}
          fill="none"
          stroke={line}
          strokeWidth="0.35"
          opacity="0.5"
        />
      ))}
      {orbitArc(306, -1).map((d, i) => (
        <circle
          key={`oa-b-${i}`}
          cx={d.x}
          cy={d.y}
          r={d.r}
          fill="none"
          stroke={line}
          strokeWidth="0.35"
          opacity="0.5"
        />
      ))}

      {/* 光源环 r=12 环形光（中心镂空，光峰在左右两段弧所在圆） */}
      <circle
        cx={CX}
        cy={CY}
        r={EYE_RING_GLOW_R}
        fill={`url(#${uid}-ring-glow)`}
        mask={`url(#${uid}-ring-glow-mask)`}
      />

      <GalaxyOrbitSpin enabled={spin} direction="cw">
        {/* 大椭圆四向亮星 — 随外侧右转公转 */}
        {orbitSpin &&
          ELLIPSE_CORNER_STAR_POSITIONS.map(([x, y], i) => (
            <g key={`ell-corner-spin-${i}`}>{star(x, y, 4, 0.7)}</g>
          ))}

        {/* 外侧正圆：r=90 / 104 及刻度 */}
        {dialTicks.map((t, i) => (
          <line
            key={`tick-${i}`}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={line}
            strokeWidth="0.35"
            opacity="0.45"
          />
        ))}
        {dotsOnCircle(90, 48, 0.7, 0.6).map((d, i) => (
          <circle key={`d90-${i}`} cx={d.cx} cy={d.cy} r={d.dotR} fill={line} opacity={d.op} />
        ))}
        <circle cx={CX} cy={CY} r="104" fill="none" stroke={line} strokeWidth="0.3" opacity="0.35" />
        <circle cx={CX} cy={CY} r="90" fill="none" stroke={line} strokeWidth="0.45" opacity="0.6" />

        {/* 辐射线 */}
        <g filter={`url(#${uid}-sg)`}>
          {rays.map((r, i) => (
            <line
              key={`ray-${i}`}
              x1={r.x1}
              y1={r.y1}
              x2={r.x2}
              y2={r.y2}
              stroke={bright}
              strokeWidth={r.w}
              opacity="0.25"
            />
          ))}
        </g>

        {/* 十字准线 */}
        <line x1={CX} y1="58" x2={CX} y2={H - 58} stroke={line} strokeWidth="0.28" opacity="0.32" />
        <line x1="42" y1={CY} x2={W - 42} y2={CY} stroke={line} strokeWidth="0.28" opacity="0.32" />

        {Array.from({ length: 19 }, (_, i) => {
          const y = CY - 90 + i * 10;
          const w = i % 3 === 0 ? 3 : 1.5;
          return (
            <line
              key={`ax-y-${i}`}
              x1={CX - w}
              y1={r2(y)}
              x2={CX + w}
              y2={r2(y)}
              stroke={line}
              strokeWidth="0.3"
              opacity="0.35"
            />
          );
        })}
        {Array.from({ length: 19 }, (_, i) => {
          const x = CX - 90 + i * 10;
          const h = i % 3 === 0 ? 3 : 1.5;
          return (
            <line
              key={`ax-x-${i}`}
              x1={r2(x)}
              y1={CY - h}
              x2={r2(x)}
              y2={CY + h}
              stroke={line}
              strokeWidth="0.3"
              opacity="0.35"
            />
          );
        })}
      </GalaxyOrbitSpin>

      <GalaxyOrbitSpin enabled={spin} direction="ccw">
        {/* 竖列四芒星外端所在正圆 r=64 及内侧 — 向左转 */}
        <circle
          cx={CX}
          cy={CY}
          r={ORBIT_SPLIT_R}
          fill="none"
          stroke={line}
          strokeWidth="0.35"
          opacity="0.45"
        />
        {dotsOnCircle(64, 32, 0.55, 0.5).map((d, i) => (
          <circle key={`d64-${i}`} cx={d.cx} cy={d.cy} r={d.dotR} fill={line} opacity={d.op} />
        ))}
        <circle
          cx={CX}
          cy={CY}
          r="46"
          fill="none"
          stroke={line}
          strokeWidth="0.3"
          opacity="0.4"
        />
        <circle cx={CX} cy={CY} r="24" fill="none" stroke={line} strokeWidth="0.4" opacity="0.55" />

        <g filter={`url(#${uid}-sg)`}>
          <circle
            cx={CX}
            cy={CY}
            r={EYE_MAIN_R}
            fill="none"
            stroke={line}
            strokeWidth="0.42"
            opacity="0.55"
          />
          <circle
            cx={CX}
            cy={CY}
            r="16.5"
            fill="none"
            stroke={line}
            strokeWidth="0.24"
            strokeDasharray="0.8 2.8"
            opacity="0.32"
          />
          <circle
            cx={CX}
            cy={CY}
            r="25"
            fill="none"
            stroke={line}
            strokeWidth="0.22"
            strokeDasharray="0.6 3.2"
            opacity="0.26"
          />
          {eyeOrbitDots(EYE_MAIN_R, 12).map((d, i) => (
            <circle key={`od20-${i}`} cx={d.cx} cy={d.cy} r="0.45" fill={line} opacity="0.45" />
          ))}
          {eyeOrbitDots(25, 16).map((d, i) => (
            <circle key={`od25-${i}`} cx={d.cx} cy={d.cy} r="0.35" fill={line} opacity="0.32" />
          ))}

          {eyeCardinalStars.map(([x, y, size, op], i) => (
            <g key={`card-${i}`}>{starStroke(x, y, size, op, 0.42)}</g>
          ))}
          {eyeColumnStars.map(([x, y, size, op], i) => (
            <g key={`col-${i}`}>{starStroke(x, y, size, op, 0.34)}</g>
          ))}
          {eyeStars.map((s, i) => (
            <g key={`eye-star-${i}`}>{starStroke(s.x, s.y, s.size, s.op, 0.28)}</g>
          ))}
        </g>
      </GalaxyOrbitSpin>

      {/* 行星 + 月牙点缀 */}
      <g opacity="0.6">
        <circle cx={CX} cy={CY - 150} r="4" fill="none" stroke={line} strokeWidth="0.4" />
        <ellipse
          cx={CX}
          cy={CY - 150}
          rx="7.6"
          ry="2.8"
          fill="none"
          stroke={line}
          strokeWidth="0.35"
          transform={`rotate(-20 ${CX} ${CY - 150})`}
        />
      </g>
      {crescent(CX, CY + 150, 5)}

      {/* 散落星点 */}
      {scatter.map(([x, y, r], i) => (
        <g key={`sc-${i}`}>{star(x, y, r, 0.6)}</g>
      ))}

      {/* 中央月牙星芒（火焰已移除，月牙放大） */}
      <g filter={`url(#${uid}-sg)`}>
        {/* 外装饰环 + 珠环 */}
        <circle cx={CX} cy={CY} r="13.8" fill="none" stroke={line} strokeWidth="0.38" opacity="0.55" />
        {Array.from({ length: 28 }, (_, i) => {
          const a = (i / 28) * Math.PI * 2;
          return <circle key={`ringdot-${i}`} cx={r2(CX + Math.cos(a) * 13.8)} cy={r2(CY + Math.sin(a) * 13.8)} r="0.32" fill={line} opacity="0.5" />;
        })}

        {/* 中心月牙 + 小星（再放大） */}
        <g opacity="0.96">
          <circle cx={CX} cy={CY} r="14.8" fill="none" stroke={bright} strokeWidth="1.05" />
          <circle cx={CX + 5.0} cy={CY + 0.6} r="12.0" fill="none" stroke={line} strokeWidth="0.88" />
          {starStroke(CX - 7.0, CY - 3.3, 2.2, 0.82, 0.36)}
          {starStroke(CX + 7.1, CY + 3.9, 2.05, 0.78, 0.34)}
        </g>

        {/* 月牙形发光（随月牙再放大） */}
        <g>
          <defs>
            <radialGradient id={`${uid}-crescent-glow`} gradientUnits="userSpaceOnUse" cx={CX + 5.0} cy={CY + 0.6} r="22">
              <stop offset="0%" stopColor={bright} stopOpacity="0.48" />
              <stop offset="38%" stopColor={glow} stopOpacity="0.22" />
              <stop offset="100%" stopColor={glow} stopOpacity="0" />
            </radialGradient>
            <mask id={`${uid}-crescent-mask`}>
              <circle cx={CX + 5.0} cy={CY + 0.6} r="22" fill="white" />
              <circle cx={CX + 13.4} cy={CY + 1.6} r="15.6" fill="black" />
            </mask>
          </defs>
          <circle
            cx={CX + 5.0}
            cy={CY + 0.6}
            r="22"
            fill={`url(#${uid}-crescent-glow)`}
            mask={`url(#${uid}-crescent-mask)`}
          />
        </g>
      </g>

      {/* 上下缩小版火焰图案（与中央月亮同亮度） */}
      {[102, 322].map((yPos, idx) => (
        <g key={`mini-flame-${idx}`} transform={`translate(${CX} ${yPos}) scale(0.48)`} opacity="0.96">
          {/* 下方小火焰中心加月亮一样的月牙发光（放在最底层） */}
          {idx === 1 && (
            <g>
              <defs>
                <radialGradient id={`${uid}-mini-crescent-glow`} gradientUnits="userSpaceOnUse" cx="0" cy="0" r="32">
                  <stop offset="0%" stopColor={bright} stopOpacity="0.55" />
                  <stop offset="32%" stopColor={glow} stopOpacity="0.28" />
                  <stop offset="100%" stopColor={glow} stopOpacity="0" />
                </radialGradient>
                <mask id={`${uid}-mini-crescent-mask`}>
                  <circle cx="0" cy="0" r="32" fill="white" />
                  <circle cx="9.5" cy="1.2" r="22.5" fill="black" />
                </mask>
              </defs>
              <circle cx="0" cy="0" r="32" fill={`url(#${uid}-mini-crescent-glow)`} mask={`url(#${uid}-mini-crescent-mask)`} />
            </g>
          )}
          <g>
            {/* 外珠环（与中央同亮度） */}
            <circle r="13.8" fill="none" stroke={line} strokeWidth="0.38" opacity="0.55" />
            {Array.from({ length: 20 }, (_, i) => {
              const a = (i / 20) * Math.PI * 2;
              return <circle key={i} cx={r2(Math.cos(a) * 13.8)} cy={r2(Math.sin(a) * 13.8)} r="0.28" fill={line} opacity="0.5" />;
            })}
            {/* 8 条小火焰芒（破浪感，空隙收窄） */}
            {[24.5, 29.8, 25.6, 30.4, 23.8, 28.9, 26.1, 31.0].map((outer, i) => {
              const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
              const inner = 13.2;
              const mid = inner + (outer - inner) * 0.48;
              const wave = 3.4 + (i % 3) * 0.32;
              const p = a + Math.PI / 2;
              const x1 = r2(Math.cos(a) * inner);
              const y1 = r2(Math.sin(a) * inner);
              const x2 = r2(Math.cos(a) * outer);
              const y2 = r2(Math.sin(a) * outer);
              const mx1 = r2(Math.cos(a) * mid + Math.cos(p) * wave);
              const my1 = r2(Math.sin(a) * mid + Math.sin(p) * wave);
              const mx2 = r2(Math.cos(a) * mid - Math.cos(p) * wave);
              const my2 = r2(Math.sin(a) * mid - Math.sin(p) * wave);
              return (
                <g key={i}>
                  <path d={`M ${x1} ${y1} Q ${mx1} ${my1} ${x2} ${y2} Q ${mx2} ${my2} ${x1} ${y1}`} fill="none" stroke={bright} strokeWidth="0.72" opacity="0.94" strokeLinejoin="round" />
                  <circle cx={r2(Math.cos(a) * (inner + 3.8))} cy={r2(Math.sin(a) * (inner + 3.8))} r="0.38" fill={line} opacity="0.6" />
                  <circle cx={r2(Math.cos(a) * (inner + 9.1))} cy={r2(Math.sin(a) * (inner + 9.1))} r="0.3" fill={line} opacity="0.48" />
                </g>
              );
            })}
            {/* 小月牙 + 星（与中央月亮同亮度） */}
            <circle r="7.2" fill="none" stroke={bright} strokeWidth="0.64" />
            <circle cx={2.6} cy={0.3} r="5.9" fill="none" stroke={line} strokeWidth="0.54" />
            {starStroke(-3.5, -1.6, 1.0, 0.82, 0.36)}
            {starStroke(3.6, 2.0, 0.92, 0.78, 0.34)}
          </g>
        </g>
      ))}

      {/* 下方小火焰下方的竖排四芒星（与边框四角星同大小、同色效果） */}
      {starStroke(CX, 355, 5.8, 0.88, 0.46)}
      {starStroke(CX, 385, 5.8, 0.88, 0.46)}

      {/* 两侧竖排文字 */}
      <text
        x="32"
        y={CY}
        fill={line}
        fontFamily="Georgia, serif"
        fontSize="7"
        letterSpacing="3"
        opacity="0.4"
        textAnchor="middle"
        transform={`rotate(-90 32 ${CY})`}
      >
        ARCANA ARCHIVE
      </text>
      <text
        x={W - 32}
        y={CY}
        fill={line}
        fontFamily="Georgia, serif"
        fontSize="7"
        letterSpacing="3"
        opacity="0.4"
        textAnchor="middle"
        transform={`rotate(90 ${W - 32} ${CY})`}
      >
        DIGITAL OCCULT TAROT
      </text>
    </svg>
  );
}
