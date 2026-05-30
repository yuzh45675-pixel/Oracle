"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface BreatheEntryProps {
  variant?: "floating" | "inline";
  /** inline 时：circle 正圆 / ellipse 扁椭圆 */
  shape?: "circle" | "ellipse";
  className?: string;
}

function BreathePulseRings({ ellipse = false }: { ellipse?: boolean }) {
  return (
    <>
      <span
        aria-hidden
        className={`absolute opacity-70 blur-md ${
          ellipse ? "-inset-x-3 -inset-y-4 rounded-full" : "-inset-4 rounded-full opacity-80"
        }`}
        style={{
          background: ellipse
            ? "radial-gradient(ellipse 85% 100% at 50% 50%, var(--glow-primary) 0%, transparent 70%)"
            : "radial-gradient(circle, var(--glow-primary) 0%, transparent 68%)",
        }}
      />
      <motion.span
        aria-hidden
        className={`absolute rounded-full border border-accent/25 ${
          ellipse ? "-inset-x-1 -inset-y-2" : "-inset-2"
        }`}
        animate={{ scale: [1, 1.28, 1], opacity: [0.55, 0, 0.55] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        aria-hidden
        className={`absolute rounded-full border border-accent/40 bg-accent/[0.06] ${
          ellipse ? "inset-x-3 inset-y-1.5" : "inset-2"
        }`}
        animate={{ scale: [1, 1.14, 1], opacity: [0.72, 0.28, 0.72] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

/** 呼吸入口：手机右下角悬浮 / 桌面左列扁椭圆 */
export function BreatheEntry({
  variant = "floating",
  shape = "ellipse",
  className = "",
}: BreatheEntryProps) {
  if (variant === "inline") {
    const isEllipse = shape === "ellipse";
    return (
      <motion.div
        className={`flex w-full justify-center ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, -4, 0] }}
        transition={{
          opacity: { delay: 0.95, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
          y: {
            delay: 1.55,
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-full"
        >
          <Link
            href="/breathe"
            className={`group relative flex items-center justify-center border border-accent/40 bg-white/[0.06] text-frost backdrop-blur-xl transition-colors hover:border-accent/65 hover:bg-accent/10 ${
              isEllipse
                ? "h-11 w-full rounded-full xl:h-12"
                : "h-14 w-14 rounded-full"
            }`}
            aria-label="呼吸练习"
          >
            <BreathePulseRings ellipse={isEllipse} />
            <span className="relative text-[11px] tracking-[0.28em] text-frost/95 drop-shadow-[0_0_10px_var(--glow-primary)] xl:text-xs">
              呼吸
            </span>
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-5 z-40 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
      transition={{
        opacity: { delay: 1.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        scale: { delay: 1.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <Link
        href="/breathe"
        aria-label="呼吸练习"
        className="group relative flex h-20 w-20 items-center justify-center rounded-full border border-accent/45 bg-white/[0.08] text-frost backdrop-blur-2xl transition-colors hover:border-accent/75 hover:bg-accent/12"
      >
        <BreathePulseRings />
        <span className="relative text-xs tracking-[0.22em] text-frost/95 drop-shadow-[0_0_10px_var(--glow-primary)]">
          呼吸
        </span>
      </Link>
    </motion.div>
  );
}
