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
import { BreatheEntry } from "@/components/hero/BreatheEntry";
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
        左：解读体系 · 中：标题与操作 · 右：牌面
      */}
      <motion.div
        className="relative z-10 mx-auto flex aspect-[4/3] w-[min(94vw,calc(100dvh*4/3))] max-h-[calc(100dvh-4.5rem)] items-center px-[3%] py-[5%]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="grid w-full grid-cols-[minmax(10.5rem,12.5rem)_minmax(0,1fr)_auto] items-center gap-0 xl:gap-1">
          {/* 左：塔罗 / 雷诺曼 */}
          <motion.div
            className="origin-left scale-[0.9] xl:scale-[0.92]"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          >
            <ReadingSystemSelector
              value={system}
              onChange={onSystemChange}
              align="start"
              variant="desktop"
            />
          </motion.div>

          {/* 中：标题、文案、按钮、呼吸、意识色调 */}
          <div className="flex min-w-0 flex-col items-center px-1 text-center sm:px-2">
            <motion.p
              className="mb-3 text-xs tracking-[0.5em] text-accent/90 uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Digital Oracle
            </motion.p>

            <motion.h1
              className="font-display max-w-full text-[clamp(1.65rem,2.8vw,2.75rem)] leading-tight font-extralight tracking-tight whitespace-nowrap text-frost"
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              在静默中
              <span className="bg-gradient-to-r from-frost via-metal to-accent/80 bg-clip-text text-transparent">
                遇见答案
              </span>
            </motion.h1>

            <motion.p
              className="mt-4 max-w-[28rem] text-[clamp(0.8rem,1.1vw,1rem)] leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <span
                className="tracking-wide"
                style={{ color: theme.colors.accentSoft }}
              >
                Oracle —— 并非预测未来，而是重新理解当下。
              </span>
            </motion.p>

            <motion.div
              className="mt-6 flex flex-row flex-wrap items-center justify-center gap-3 xl:mt-7 xl:gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.7 }}
            >
              <RitualEnterButton system={system} />
            </motion.div>

            <BreatheEntry variant="inline" />

            <motion.div
              className="mt-6 flex w-full flex-col items-center xl:mt-7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.05 }}
            >
              <p className="mb-3 text-center text-[9px] tracking-[0.28em] text-muted/70 uppercase xl:text-[10px]">
                意识色调 · 移动鼠标凝聚粒子
              </p>
              <ThemeOrbStrip className="!justify-center" />
            </motion.div>
          </div>

          {/* 右：牌面（略向左靠，贴近中间操作区） */}
          <motion.div
            className="-ml-1 flex shrink-0 items-center justify-center xl:-ml-3"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="relative origin-center scale-[0.92] xl:scale-95"
              style={{ x: cardX, y: cardY }}
              animate={{ y: [0, -10, 0] }}
              transition={{
                y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <motion.div
                className="absolute -inset-[16%] rounded-full"
                style={{
                  background: `radial-gradient(circle, ${theme.colors.glowPrimary} 0%, transparent 62%)`,
                }}
                animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.7, 0.45] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <TarotCard size="hero" interactive={false} />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
