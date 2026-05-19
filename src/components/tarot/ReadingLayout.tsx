"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { ParticleBackground } from "@/components/three/ParticleBackground";
import { FloatingGlow } from "@/components/ui/FloatingGlow";

interface ReadingLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  dissolve?: number;
  wide?: boolean;
  badge?: string;
}

export function ReadingLayout({
  children,
  title,
  subtitle,
  dissolve = 1,
  wide = false,
  badge = "Oracle Reading",
}: ReadingLayoutProps) {
  return (
    <motion.section
      className="relative min-h-screen overflow-hidden bg-void pt-28 pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(12px)" }}
      transition={{ duration: 0.6 }}
    >
      <ParticleBackground dissolve={dissolve} intensity={1} />
      <FloatingGlow className="left-1/2 top-1/4 -translate-x-1/2" size={600} />
      <FloatingGlow
        className="right-0 bottom-0 translate-x-1/3"
        color="rgba(74, 108, 247, 0.2)"
        size={400}
      />

      <motion.div
        className={`relative z-10 mx-auto px-6 md:px-10 ${wide ? "max-w-6xl" : "max-w-4xl"}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="mb-12 text-center md:mb-16">
          <motion.p
            className="mb-3 text-xs tracking-[0.4em] text-accent uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {badge}
          </motion.p>
          <h1 className="font-display text-3xl font-light tracking-tight text-frost md:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted">
              {subtitle}
            </p>
          )}
        </header>
        {children}
      </motion.div>
    </motion.section>
  );
}
