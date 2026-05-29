"use client";

import Link from "next/link";
import { motion } from "framer-motion";

/** 首页悬浮呼吸入口：右下角小圆钮 → /breathe */
export function FloatingBreatheButton() {
  return (
    <motion.div
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href="/breathe"
        aria-label="呼吸练习"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-white/[0.06] text-frost backdrop-blur-xl transition-colors hover:border-accent/60 hover:bg-accent/10"
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full opacity-60"
          style={{
            boxShadow: "0 0 24px var(--glow-primary)",
          }}
        />
        <motion.span
          aria-hidden
          className="absolute inset-2 rounded-full border border-accent/30"
          animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.15, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="relative text-[10px] tracking-[0.18em] text-frost/90">
          呼吸
        </span>
      </Link>
    </motion.div>
  );
}
