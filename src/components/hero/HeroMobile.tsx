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

interface HeroMobileProps {
  system: ReadingSystemChoice;
  onSystemChange: (value: ReadingSystemChoice) => void;
  cardX: MotionValue<number>;
  cardY: MotionValue<number>;
  theme: OracleTheme;
}

export function HeroMobile({
  system,
  onSystemChange,
  cardX,
  cardY,
  theme,
}: HeroMobileProps) {
  return (
    <>
      <FloatingGlow
        className="left-1/2 top-[32%] -translate-x-1/2 scale-[0.55] opacity-80 sm:scale-75 sm:opacity-90"
        size={640}
        color={theme.colors.glowPrimary}
      />
      <FloatingGlow
        className="left-1/4 top-[68%] scale-[0.6] opacity-70 sm:scale-90 sm:opacity-80"
        size={350}
        color={theme.colors.glowSecondary}
      />

      <motion.div
        className="relative z-10 flex w-full flex-col items-center px-5 pt-[max(4.25rem,calc(env(safe-area-inset-top)+3.75rem))] pb-10 text-center sm:px-6 sm:pb-14"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.p
          className="mb-4 text-[10px] tracking-[0.42em] text-accent/75 uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Digital Oracle
        </motion.p>

        <motion.h1
          className="font-display max-w-[16rem] text-[1.625rem] leading-[1.2] font-extralight tracking-tight text-frost/95 sm:max-w-3xl sm:text-3xl"
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          在静默中
          <br />
          <span className="bg-gradient-to-r from-frost/90 via-metal/85 to-accent/55 bg-clip-text text-transparent">
            遇见答案
          </span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-4 max-w-[17rem] text-xs leading-relaxed sm:mt-6 sm:max-w-md sm:text-sm"
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
          className="relative my-7 sm:my-10"
          style={{ x: cardX, y: cardY }}
          animate={{ y: [0, -6, 0] }}
          transition={{
            y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <motion.div
            className="absolute -inset-10 rounded-full opacity-50"
            style={{
              background: `radial-gradient(circle, ${theme.colors.glowPrimary} 0%, transparent 65%)`,
            }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <TarotCard size="hero" interactive={false} />
        </motion.div>

        <ReadingSystemSelector value={system} onChange={onSystemChange} />

        <motion.div
          className="mt-6 flex flex-col items-center gap-3 sm:mt-8 sm:flex-row sm:gap-4"
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
          className="mt-10 w-full max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05 }}
        >
          <p className="mb-4 text-center text-[9px] tracking-[0.28em] text-muted/70 uppercase">
            意识色调 · 长按空白处凝聚图案
          </p>
          <ThemeOrbStrip />
        </motion.div>
      </motion.div>
    </>
  );
}
