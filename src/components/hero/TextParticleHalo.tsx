"use client";

import { motion } from "framer-motion";

const ORBIT = Array.from({ length: 14 }, (_, i) => ({
  angle: (i / 14) * Math.PI * 2,
  radius: 28 + (i % 3) * 8,
  delay: i * 0.07,
  duration: 2.8 + (i % 4) * 0.35,
}));

interface TextParticleHaloProps {
  active: boolean;
}

/** 悬停时在文字周围形成轻量粒子云（配合全局 WebGL 粒子聚拢） */
export function TextParticleHalo({ active }: TextParticleHaloProps) {
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <motion.div
        className="absolute left-1/2 top-1/2 h-24 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{ background: "var(--glow-primary)" }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: [0.25, 0.5, 0.25], scale: [0.9, 1.08, 0.9] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      {ORBIT.map((o, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-1/2 h-[3px] w-[3px] rounded-full bg-accent/90 shadow-[0_0_8px_var(--accent)]"
          animate={{
            x: [
              Math.cos(o.angle) * o.radius * 0.6,
              Math.cos(o.angle + 0.6) * o.radius,
              Math.cos(o.angle + 1.2) * o.radius * 0.65,
            ],
            y: [
              Math.sin(o.angle) * o.radius * 0.45,
              Math.sin(o.angle + 0.6) * o.radius * 0.75,
              Math.sin(o.angle + 1.2) * o.radius * 0.5,
            ],
            opacity: [0.15, 0.85, 0.2],
            scale: [0.5, 1.15, 0.55],
          }}
          transition={{
            duration: o.duration,
            repeat: Infinity,
            delay: o.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
