"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";
import { ParticleBackground } from "@/components/three/ParticleBackground";
import { FloatingGlow } from "@/components/ui/FloatingGlow";
import { useTheme } from "@/context/ThemeContext";

interface ReadingLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  dissolve?: number;
  wide?: boolean;
  badge?: string;
  /** Minimal header for ritual phases */
  minimal?: boolean;
}

export function ReadingLayout({
  children,
  title,
  subtitle,
  dissolve = 1,
  wide = false,
  badge = "Oracle Reading",
  minimal = false,
}: ReadingLayoutProps) {
  const { theme } = useTheme();

  return (
    <motion.section
      className="relative min-h-[100dvh] overflow-x-hidden bg-void pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))] lg:pb-12 lg:pt-[max(5rem,calc(env(safe-area-inset-top)+4rem))]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(12px)" }}
      transition={{ duration: 0.6 }}
    >
      <ParticleBackground dissolve={dissolve} intensity={1} />
      <FloatingGlow
        className="left-1/2 top-[22%] -translate-x-1/2 lg:scale-110"
        size={480}
        color={theme.colors.glowPrimary}
      />
      <FloatingGlow
        className="right-[-15%] bottom-[10%]"
        color={theme.colors.glowSecondary}
        size={320}
      />

      <motion.div
        className={`relative z-10 mx-auto px-3 sm:px-6 lg:px-8 ${
          wide
            ? "max-w-[min(100%,22rem)] sm:max-w-2xl lg:max-w-5xl xl:max-w-6xl"
            : "max-w-[min(100%,20rem)] sm:max-w-xl lg:max-w-3xl xl:max-w-4xl"
        }`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <AnimatePresence mode="wait">
          {!minimal && (
            <motion.header
              key="header"
              className="mb-8 text-center sm:mb-10 lg:mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.p
                className="mb-2 text-[10px] tracking-[0.35em] text-accent uppercase"
              >
                {badge}
              </motion.p>
              <h1 className="font-display text-2xl font-light tracking-tight text-frost sm:text-3xl lg:text-4xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-muted sm:max-w-md sm:text-sm lg:max-w-xl lg:text-base">
                  {subtitle}
                </p>
              )}
            </motion.header>
          )}
        </AnimatePresence>
        {children}
      </motion.div>
    </motion.section>
  );
}
