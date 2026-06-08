"use client";

import { useReducedMotion } from "framer-motion";
import { useVisualProfile } from "@/hooks/useVisualProfile";

interface FloatingGlowProps {
  className?: string;
  color?: string;
  size?: number;
}

/** 光晕：全机型保留；手机仅 scale 动画，避免 opacity 脉冲导致整屏闪 */
export function FloatingGlow({
  className = "",
  color = "rgba(110, 91, 255, 0.35)",
  size = 480,
}: FloatingGlowProps) {
  const reducedMotion = useReducedMotion();
  const profile = useVisualProfile();
  const animate = profile.glowMotion && !reducedMotion;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-[100px] ${
        animate ? "glow-breathe-slow" : ""
      } ${className}`}
      style={{
        width: size,
        height: size,
        opacity: profile.tier === "full" ? 0.42 : 0.34,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      }}
    />
  );
}
