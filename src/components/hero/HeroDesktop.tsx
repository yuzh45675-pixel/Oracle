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
        className="left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 opacity-90"
        size={680}
        color={theme.colors.glowPrimary}
      />
      <FloatingGlow
        className="left-1/2 top-[62%] -translate-x-1/2 opacity-60"
        size={400}
        color={theme.colors.glowSecondary}
      />

      {/* 居中宽幅双栏，从页面正中裁 3:2 时两侧留白均衡 */}
      <motion.div
        className="relative z-10 mx-auto grid w-full max-w-[860px] grid-cols-[1fr_auto] items-center gap-10 px-6 xl:max-w-[940px] xl:gap-14 xl:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex min-w-0 flex-col items-start text-left">
          <motion.p
            className="mb-4 text-xs tracking-[0.5em] text-accent/90 uppercase"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Digital Oracle
          </motion.p>

          <motion.h1
            className="font-display max-w-lg text-[2.65rem] leading-[1.12] font-extralight tracking-tight text-frost xl:text-5xl xl:leading-[1.1]"
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
            className="mt-5 max-w-md text-base leading-relaxed xl:mt-6 xl:text-lg"
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
            className="mt-8 w-full max-w-xl xl:mt-9"
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
            className="mt-7 flex flex-row flex-wrap items-center gap-4 xl:mt-8"
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
            className="mt-8 w-full max-w-sm xl:mt-9"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05 }}
          >
            <p className="mb-4 text-[10px] tracking-[0.32em] text-muted/70 uppercase">
              意识色调 · 移动鼠标凝聚粒子
            </p>
            <ThemeOrbStrip className="!justify-start" />
          </motion.div>
        </div>

        <motion.div
          className="flex shrink-0 items-center justify-center px-2 xl:px-4"
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
            <div className="origin-center scale-105 xl:scale-110">
              <TarotCard size="hero" interactive={false} />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}
