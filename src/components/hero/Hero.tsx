"use client";

import { useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { TarotCard } from "@/components/tarot/TarotCard";
import { ParticleBackground } from "@/components/three/ParticleBackground";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { FloatingGlow } from "@/components/ui/FloatingGlow";
import { ThemeOrbStrip } from "@/components/ui/ThemeOrbStrip";
import { useTheme } from "@/context/ThemeContext";
import {
  ReadingSystemSelector,
  type ReadingSystemChoice,
} from "@/components/hero/ReadingSystemSelector";
import { RitualEnterButton } from "@/components/hero/RitualEnterButton";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";

export function Hero() {
  const { theme } = useTheme();
  const isTouch = useIsTouchDevice();
  const [system, setSystem] = useState<ReadingSystemChoice>("tarot");
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 80, damping: 20 });
  const springY = useSpring(pointerY, { stiffness: 80, damping: 20 });
  const cardX = useTransform(springX, [-0.5, 0.5], [-8, 8]);
  const cardY = useTransform(springY, [-0.5, 0.5], [-12, 12]);

  const setPointer = (clientX: number, clientY: number) => {
    pointerX.set(clientX / window.innerWidth - 0.5);
    pointerY.set(clientY / window.innerHeight - 0.5);
  };

  return (
    <section
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden pb-[max(2rem,env(safe-area-inset-bottom))]"
      onMouseMove={(e) => setPointer(e.clientX, e.clientY)}
      onTouchMove={(e) => {
        const t = e.touches[0];
        if (t) setPointer(t.clientX, t.clientY);
      }}
    >
      <ParticleBackground intensity={isTouch ? 0.82 : 1.05} />

      <FloatingGlow
        className="left-1/2 top-[32%] -translate-x-1/2 scale-[0.55] opacity-80 sm:scale-75 sm:opacity-90 md:scale-100 md:opacity-100"
        size={640}
        color={theme.colors.glowPrimary}
      />
      <FloatingGlow
        className="left-1/4 top-[68%] scale-[0.6] opacity-70 sm:scale-90 sm:opacity-80 md:scale-100 md:opacity-90"
        size={350}
        color={theme.colors.glowSecondary}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse 100% 80% at 50% 100%, color-mix(in srgb, var(--mystic) 80%, transparent) 0%, transparent 60%)`,
        }}
        animate={{ opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative z-10 flex w-full max-w-6xl flex-col items-center px-5 pt-[max(4.25rem,calc(env(safe-area-inset-top)+3.75rem))] pb-10 text-center sm:px-6 sm:pb-14 md:px-10 md:pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))] md:pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.p
          className="mb-4 text-[10px] tracking-[0.42em] text-accent/75 uppercase md:mb-6 md:text-xs md:tracking-[0.5em] md:text-accent/90"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Digital Oracle
        </motion.p>

        <motion.h1
          className="font-display max-w-[16rem] text-[1.625rem] leading-[1.2] font-extralight tracking-tight text-frost/95 sm:max-w-3xl sm:text-3xl md:text-6xl md:leading-[1.15] md:text-frost lg:text-7xl"
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          在静默中
          <br />
          <span className="bg-gradient-to-r from-frost/90 via-metal/85 to-accent/55 bg-clip-text text-transparent md:from-frost md:via-metal md:to-accent/80">
            遇见答案
          </span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-4 max-w-[17rem] text-xs leading-relaxed sm:mt-6 sm:max-w-md sm:text-sm md:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <span
            className="inline-block tracking-wide"
            style={{
              color: theme.colors.accentSoft,
              WebkitMaskImage:
                "linear-gradient(90deg, #000 0%, #000 35%, rgba(0,0,0,0.78) 68%, rgba(0,0,0,0.42) 100%)",
              maskImage:
                "linear-gradient(90deg, #000 0%, #000 35%, rgba(0,0,0,0.78) 68%, rgba(0,0,0,0.42) 100%)",
            }}
          >
            Oracle —— 并非预测未来，而是重新理解当下。
          </span>
        </motion.p>

        <motion.div
          className="relative my-7 sm:my-10 md:my-20"
          style={{ x: cardX, y: cardY }}
          animate={{ y: [0, -6, 0] }}
          transition={{
            y: { duration: 7, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <motion.div
            className="absolute -inset-10 rounded-full opacity-50 md:-inset-16 md:opacity-60"
            style={{
              background: `radial-gradient(circle, ${theme.colors.glowPrimary} 0%, transparent 65%)`,
            }}
            animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <TarotCard size="hero" interactive={false} />
        </motion.div>

        <ReadingSystemSelector value={system} onChange={setSystem} />

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
          className="mt-10 w-full max-w-md md:mt-14"
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
    </section>
  );
}
