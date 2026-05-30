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

/** 左列统一宽度，体系 / 呼吸 / 按钮纵向对齐 */
const LEFT_COL = "w-[17.5rem] xl:w-[19.5rem]";
/** 左列与悬浮牌间距 ≈ 「牌面解读」按钮宽度 */
const MID_GAP = "gap-[7.25rem] xl:gap-[8.5rem] 2xl:gap-[9.5rem]";

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
        className="left-[62%] top-[58%] -translate-x-1/2 opacity-55"
        size={420}
        color={theme.colors.glowSecondary}
      />

      <motion.div
        className="relative z-10 mx-auto flex aspect-[4/3] w-[min(94vw,calc(100dvh*4/3))] max-h-[calc(100dvh-4.5rem)] flex-col px-[5%] py-[5%]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="mb-6 flex shrink-0 flex-col items-center text-center xl:mb-8">
          <motion.p
            className="mb-3 text-xs tracking-[0.5em] text-accent/90 uppercase"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Digital Oracle
          </motion.p>

          <motion.h1
            className="font-display text-[clamp(1.9rem,3.2vw,3.1rem)] leading-tight font-extralight tracking-tight whitespace-nowrap text-frost"
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
            className="mt-4 max-w-[34rem] text-[clamp(0.8rem,1.1vw,1rem)] leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.8 }}
          >
            <span className="tracking-wide" style={{ color: theme.colors.accentSoft }}>
              Oracle —— 并非预测未来，而是重新理解当下。
            </span>
          </motion.p>
        </header>

        <div className={`flex min-h-0 flex-1 items-center justify-center ${MID_GAP}`}>
          <motion.div
            className={`flex flex-col items-stretch gap-7 xl:gap-8 ${LEFT_COL}`}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.65, duration: 0.7 }}
          >
            <ReadingSystemSelector
              value={system}
              onChange={onSystemChange}
              align="center"
              variant="desktop"
              orientation="vertical"
              showHint={false}
            />

            <BreatheEntry variant="inline" shape="ellipse" className="w-full" />

            <motion.div
              className="flex w-full flex-row flex-wrap items-center justify-center gap-3 xl:gap-3.5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7 }}
            >
              <RitualEnterButton system={system} />
            </motion.div>

            <div className="flex flex-col items-center pt-1">
              <p className="mb-3 text-[9px] tracking-[0.28em] text-muted/65 uppercase">
                意识色调
              </p>
              <ThemeOrbStrip compact />
            </div>
          </motion.div>

          <motion.div
            className="flex shrink-0 items-center justify-center"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="relative origin-center scale-100 xl:scale-110"
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
