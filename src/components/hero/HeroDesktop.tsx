"use client";

import { motion, type MotionValue } from "framer-motion";
import { TarotCard } from "@/components/tarot/TarotCard";
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
        className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90"
        size={720}
        color={theme.colors.glowPrimary}
      />
      <FloatingGlow
        className="left-1/2 top-[58%] -translate-x-1/2 opacity-55"
        size={420}
        color={theme.colors.glowSecondary}
      />

      {/*
        4:3 横屏画幅（宽:高 = 4:3）
        录站视频时从浏览器正中裁这一块即可
      */}
      <motion.div
        className="relative z-10 mx-auto flex aspect-[4/3] w-[min(94vw,calc(100dvh*4/3))] max-h-[calc(100dvh-4.5rem)] items-center px-[4%] py-[5%]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="grid w-full grid-cols-[1.05fr_0.95fr] items-center gap-[2.5%]">
          <div className="flex min-w-0 flex-col items-start text-left">
            <motion.p
              className="mb-3 text-xs tracking-[0.5em] text-accent/90 uppercase xl:mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Digital Oracle
            </motion.p>

            <motion.h1
              className="font-display text-[clamp(2rem,3.2vw,3rem)] leading-[1.12] font-extralight tracking-tight text-frost"
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
              className="mt-4 max-w-[95%] text-[clamp(0.875rem,1.25vw,1.125rem)] leading-relaxed xl:mt-5"
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
              className="mt-6 w-full origin-top-left scale-[0.92] xl:mt-7 xl:scale-95"
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
              className="mt-5 flex flex-row flex-wrap items-center gap-3 xl:mt-6 xl:gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
            >
              <RitualEnterButton system={system} />
            </motion.div>

            <motion.div
              className="mt-5 xl:mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.05 }}
            >
              <p className="mb-3 text-[9px] tracking-[0.28em] text-muted/70 uppercase xl:text-[10px]">
                意识色调 · 移动鼠标凝聚粒子
              </p>
              <ThemeOrbStrip className="!justify-start" />
            </motion.div>
          </div>

          <motion.div
            className="flex items-center justify-center"
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
                className="absolute -inset-[18%] rounded-full"
                style={{
                  background: `radial-gradient(circle, ${theme.colors.glowPrimary} 0%, transparent 62%)`,
                }}
                animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.7, 0.45] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="origin-center scale-100 xl:scale-105">
                <TarotCard size="hero" interactive={false} />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
