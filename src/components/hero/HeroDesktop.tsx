"use client";

import { motion, type MotionValue } from "framer-motion";
import { TarotCard } from "@/components/tarot/TarotCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { FloatingGlow } from "@/components/ui/FloatingGlow";
import { ThemeOrbStrip } from "@/components/ui/ThemeOrbStrip";
import {
  ReadingSystemSelector,
  type ReadingSystemChoice,
} from "@/components/hero/ReadingSystemSelector";
import { RitualEnterButton } from "@/components/hero/RitualEnterButton";
import type { OracleTheme } from "@/lib/themes";

interface HeroDesktopProps {
  system: ReadingSystemChoice;
  onSystemChange: (value: ReadingSystemChoice) => void;
  cardX: MotionValue<number>;
  cardY: MotionValue<number>;
  theme: OracleTheme;
}

export function HeroDesktop({
  system,
  onSystemChange,
  cardX,
  cardY,
  theme,
}: HeroDesktopProps) {
  return (
    <>
      <FloatingGlow
        className="right-[8%] top-[28%] opacity-90 xl:right-[12%]"
        size={720}
        color={theme.colors.glowPrimary}
      />
      <FloatingGlow
        className="left-[6%] bottom-[18%] opacity-75"
        size={420}
        color={theme.colors.glowSecondary}
      />

      <motion.div
        className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] items-center gap-12 px-10 pt-[max(5rem,calc(env(safe-area-inset-top)+4rem))] pb-16 xl:max-w-[82rem] xl:grid-cols-[1.1fr_0.9fr] xl:gap-20 xl:px-14"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-col items-start text-left">
          <motion.p
            className="mb-5 text-xs tracking-[0.5em] text-accent/90 uppercase"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Digital Oracle
          </motion.p>

          <motion.h1
            className="font-display max-w-xl text-5xl leading-[1.12] font-extralight tracking-tight text-frost xl:text-6xl xl:leading-[1.1]"
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            在静默中
            <br />
            <span className="bg-gradient-to-r from-frost via-metal to-accent/80 bg-clip-text text-transparent">
              遇见答案
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-md text-base leading-relaxed xl:max-w-lg xl:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <span
              className="inline-block tracking-wide"
              style={{ color: theme.colors.accentSoft }}
            >
              Oracle —— 并非预测未来，而是重新理解当下。
            </span>
          </motion.p>

          <motion.div
            className="mt-10 w-full max-w-xl xl:max-w-2xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.7 }}
          >
            <ReadingSystemSelector
              value={system}
              onChange={onSystemChange}
              align="start"
              variant="desktop"
            />
          </motion.div>

          <motion.div
            className="mt-8 flex flex-row items-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
          >
            <RitualEnterButton system={system} />
            <AnimatedButton href="/breathe" variant="ghost">
              呼吸
            </AnimatedButton>
          </motion.div>

          <motion.div
            className="mt-12 w-full max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05 }}
          >
            <p className="mb-4 text-[10px] tracking-[0.32em] text-muted/70 uppercase">
              意识色调 · 移动鼠标凝聚粒子
            </p>
            <ThemeOrbStrip className="justify-start" />
          </motion.div>
        </div>

        <motion.div
          className="relative flex items-center justify-center py-8"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="relative"
            style={{ x: cardX, y: cardY }}
            animate={{ y: [0, -12, 0] }}
            transition={{
              y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <motion.div
              className="absolute -inset-20 rounded-full"
              style={{
                background: `radial-gradient(circle, ${theme.colors.glowPrimary} 0%, transparent 62%)`,
              }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.7, 0.45] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="origin-center scale-110 xl:scale-[1.18]">
              <TarotCard size="hero" interactive={false} />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}
