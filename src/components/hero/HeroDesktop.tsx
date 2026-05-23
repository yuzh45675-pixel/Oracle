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
        className="left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 opacity-85"
        size={580}
        color={theme.colors.glowPrimary}
      />
      <FloatingGlow
        className="left-1/2 top-[58%] -translate-x-1/2 opacity-55"
        size={320}
        color={theme.colors.glowSecondary}
      />

      {/* 整块入口居中，便于从页面正中裁 3:2 截图 */}
      <motion.div
        className="relative z-10 mx-auto flex w-fit max-w-full items-center gap-4 px-4 xl:gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex w-[17.5rem] shrink-0 flex-col items-start text-left xl:w-[19rem]">
          <motion.p
            className="mb-3 text-[10px] tracking-[0.45em] text-accent/90 uppercase xl:mb-4 xl:text-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Digital Oracle
          </motion.p>

          <motion.h1
            className="font-display text-[2.25rem] leading-[1.14] font-extralight tracking-tight text-frost xl:text-[2.5rem]"
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
            className="mt-4 max-w-[16rem] text-[0.925rem] leading-relaxed xl:mt-5 xl:max-w-[17.5rem] xl:text-base"
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
            className="mt-5 origin-top-left scale-[0.92] xl:mt-6 xl:scale-[0.95]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.7 }}
          >
            <ReadingSystemSelector
              value={system}
              onChange={onSystemChange}
              align="start"
              variant="default"
            />
          </motion.div>

          <motion.div
            className="mt-4 flex flex-row flex-wrap items-center gap-2.5 xl:mt-5"
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
            className="mt-5 xl:mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05 }}
          >
            <p className="mb-3 text-[9px] tracking-[0.28em] text-muted/70 uppercase">
              意识色调 · 移动鼠标凝聚粒子
            </p>
            <ThemeOrbStrip className="!justify-start" />
          </motion.div>
        </div>

        <motion.div
          className="flex shrink-0 items-center justify-center"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="relative"
            style={{ x: cardX, y: cardY }}
            animate={{ y: [0, -10, 0] }}
            transition={{
              y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <motion.div
              className="absolute -inset-16 rounded-full xl:-inset-[4.5rem]"
              style={{
                background: `radial-gradient(circle, ${theme.colors.glowPrimary} 0%, transparent 62%)`,
              }}
              animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.65, 0.4] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="origin-center scale-[0.97] xl:scale-100">
              <TarotCard size="hero" interactive={false} />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}
