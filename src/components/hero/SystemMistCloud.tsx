"use client";

import { motion } from "framer-motion";

const MIST_BLOBS = [
  { x: -18, y: -12, s: 52, d: 0 },
  { x: 14, y: -8, s: 44, d: 0.12 },
  { x: -8, y: 10, s: 48, d: 0.2 },
  { x: 20, y: 14, s: 38, d: 0.08 },
];

const SPECKLES = Array.from({ length: 16 }, (_, i) => ({
  angle: (i / 16) * Math.PI * 2,
  r: 22 + (i % 4) * 10,
  delay: i * 0.04,
}));

const ease = [0.16, 1, 0.3, 1] as const;

interface SystemMistCloudProps {
  active: boolean;
}

/** 悬停时矢量慢慢散成云雾 */
export function SystemMistCloud({ active }: SystemMistCloudProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden
    >
      {MIST_BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-xl"
          style={{
            width: b.s,
            height: b.s,
            background: "var(--glow-primary)",
          }}
          initial={false}
          animate={{
            opacity: active ? [0.15, 0.45, 0.3] : 0,
            x: active ? [b.x * 0.5, b.x, b.x * 0.85] : 0,
            y: active ? [b.y * 0.5, b.y, b.y * 0.9] : 0,
            scale: active ? [0.7, 1.15, 1] : 0.5,
          }}
          transition={{
            opacity: { duration: 0.8, ease, delay: b.d },
            x: { duration: 2.6, repeat: active ? Infinity : 0, ease: "easeInOut", delay: b.d },
            y: { duration: 2.2, repeat: active ? Infinity : 0, ease: "easeInOut", delay: b.d },
            scale: { duration: 0.75, ease, delay: b.d },
          }}
        />
      ))}

      {SPECKLES.map((s, i) => (
        <motion.span
          key={i}
          className="absolute h-[2px] w-[2px] rounded-full bg-accent/70 blur-[0.5px]"
          initial={false}
          animate={{
            opacity: active ? [0, 0.7, 0.25] : 0,
            x: active
              ? [
                  Math.cos(s.angle) * s.r * 0.4,
                  Math.cos(s.angle + 0.5) * s.r,
                  Math.cos(s.angle + 1) * s.r * 0.7,
                ]
              : 0,
            y: active
              ? [
                  Math.sin(s.angle) * s.r * 0.35,
                  Math.sin(s.angle + 0.5) * s.r * 0.8,
                  Math.sin(s.angle + 1) * s.r * 0.55,
                ]
              : 0,
          }}
          transition={{
            opacity: { duration: 0.7, ease, delay: 0.15 + s.delay },
            x: { duration: 2.8, repeat: active ? Infinity : 0, ease: "easeInOut", delay: s.delay },
            y: { duration: 3.1, repeat: active ? Infinity : 0, ease: "easeInOut", delay: s.delay },
          }}
        />
      ))}

      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--accent) 18%, transparent) 0%, transparent 68%)",
        }}
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.85, ease }}
      />
    </div>
  );
}
