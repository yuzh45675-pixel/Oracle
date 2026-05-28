"use client";

import { motion } from "framer-motion";
import type { ReadingSystemChoice } from "./ReadingSystemSelector";

const ease = [0.16, 1, 0.3, 1] as const;

interface SystemEmblemProps {
  system: ReadingSystemChoice;
  hovered: boolean;
}

function TarotVector({ hovered }: { hovered: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className="h-full w-full text-accent/85"
      fill="none"
      animate={{
        opacity: hovered ? 0 : 1,
        filter: hovered ? "blur(10px)" : "blur(0px)",
        scale: hovered ? 1.18 : 1,
      }}
      transition={{ duration: 0.75, ease }}
    >
      <rect
        x="18"
        y="12"
        width="28"
        height="40"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="32" cy="32" r="9" stroke="currentColor" strokeWidth="0.9" />
      <path d="M32 23v18M23 32h18" stroke="currentColor" strokeWidth="0.8" />
      <path
        d="M22 20l4-4M42 20l-4-4M22 44l4 4M42 44l-4 4"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity={0.45}
      />
    </motion.svg>
  );
}

function LenormandVector({ hovered }: { hovered: boolean }) {
  const dots = [
    [24, 22],
    [32, 22],
    [40, 22],
    [24, 32],
    [32, 32],
    [40, 32],
    [24, 42],
    [32, 42],
    [40, 42],
  ] as const;

  return (
    <motion.svg
      viewBox="0 0 64 64"
      className="h-full w-full text-accent/85"
      fill="none"
      animate={{
        opacity: hovered ? 0 : 1,
        filter: hovered ? "blur(10px)" : "blur(0px)",
        scale: hovered ? 1.15 : 1,
      }}
      transition={{ duration: 0.75, ease }}
    >
      <rect
        x="16"
        y="14"
        width="32"
        height="36"
        rx="2"
        stroke="currentColor"
        strokeWidth="1"
        opacity={0.45}
      />
      {dots.map(([cx, cy], i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r="2.2"
          fill="currentColor"
          animate={{
            opacity: hovered ? 0 : 0.85,
            cx: hovered ? cx + (cx - 32) * 0.35 : cx,
            cy: hovered ? cy + (cy - 32) * 0.35 : cy,
          }}
          transition={{ duration: 0.75, ease, delay: i * 0.02 }}
        />
      ))}
    </motion.svg>
  );
}

export function SystemEmblem({ system, hovered }: SystemEmblemProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {system === "tarot" ? (
        <TarotVector hovered={hovered} />
      ) : (
        <LenormandVector hovered={hovered} />
      )}
    </div>
  );
}
