"use client";

import { motion } from "framer-motion";

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
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-[100px] ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      }}
      animate={{
        scale: [1, 1.12, 1],
        opacity: [0.35, 0.55, 0.35],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
