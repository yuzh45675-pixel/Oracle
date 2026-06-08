"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useVisualReduced } from "@/hooks/useVisualReduced";

interface FloatingGlowProps {
  className?: string;
  color?: string;
  size?: number;
}

export function FloatingGlow({
  className = "",
  color = "rgba(110, 91, 255, 0.35)",
  size = 480,
}: FloatingGlowProps) {
  const reducedMotion = useReducedMotion();
  const visualReduced = useVisualReduced();
  const staticGlow = reducedMotion || visualReduced;

  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-[100px] ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity: staticGlow ? 0.35 : undefined,
      }}
      animate={
        staticGlow
          ? undefined
          : {
              scale: [1, 1.08, 1],
              opacity: [0.3, 0.45, 0.3],
            }
      }
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
